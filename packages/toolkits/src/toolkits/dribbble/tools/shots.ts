// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  decodeFileInput,
  dribDelete,
  dribGet,
  dribPut,
  dribRaw,
  nextPageFromLink,
  shotIdFromLocation,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

const HTML_MEDIA = 'application/vnd.dribbble.v2.html+json';
const descriptionMediaType = z
  .enum(['application/vnd.dribbble.v2.html+json', 'application/vnd.dribbble.v2.text+json'])
  .optional()
  .describe(
    'Shot-description representation. Use the html media type for description or the text media type for description_text.',
  );

const imageInput = z
  .record(z.any())
  .describe(
    'Shot image as an object with filename (or name), base64 content in content_b64, and content_type (image/gif, image/jpeg or image/png). Must be exactly 400x300 or 800x600 and no larger than 8 MB.',
  );

export const dribbbleCreateShot = tool({
  description:
    'Upload an image to create a public Dribbble shot asynchronously. The connected user must be a player or team eligible to upload. Returns the shot location without polling; the URL 404s until processing finishes.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    image: imageInput,
    title: z.string().min(1).describe('Title for the new shot.'),
    description: z.string().optional().describe('Optional description for the shot.'),
    tags: z.array(z.string()).max(12).optional().describe('Tags for the shot, at most 12.'),
    teamId: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Team ID to publish under. The connected user must belong to the team.'),
    lowProfile: z.boolean().optional().describe('Publish with reduced profile visibility.'),
    scheduledFor: z
      .string()
      .optional()
      .describe('ISO 8601 publication time. Scheduling requires a Pro user or team membership.'),
    reboundSourceId: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('ID of the source shot when this shot is a rebound.'),
  }),
  execute: async ({
    dribbbleToken,
    image,
    title,
    description,
    tags,
    teamId,
    lowProfile,
    scheduledFor,
    reboundSourceId,
  }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const decoded = decodeFileInput(image);
    if ('error' in decoded) return decoded;
    if (decoded.buffer.length > 8 * 1024 * 1024) {
      return { error: 'Shot image exceeds the 8 MB Dribbble upload limit.' };
    }
    const form = new FormData();
    form.append(
      'image',
      new Blob([new Uint8Array(decoded.buffer)], { type: decoded.contentType }),
      decoded.filename,
    );
    form.append('title', title);
    if (description !== undefined) form.append('description', description);
    for (const tag of tags ?? []) form.append('tags[]', tag);
    if (teamId !== undefined) form.append('team_id', String(teamId));
    if (lowProfile !== undefined) form.append('low_profile', lowProfile ? 'true' : 'false');
    if (scheduledFor !== undefined) form.append('scheduled_for', scheduledFor);
    if (reboundSourceId !== undefined) form.append('rebound_source_id', String(reboundSourceId));
    const res = await dribRaw(dribbbleToken, 'POST', '/shots', { form });
    if (res && typeof res === 'object' && 'error' in res && !('status' in res)) return res;
    const { status, headers } = res as { status: number; headers: Headers };
    if (status !== 202) {
      const data = (res as { data: unknown }).data;
      return { error: `Dribbble API error ${status}`, details: data };
    }
    const location = headers.get('location');
    return { location, processing: true, shot_id: shotIdFromLocation(location) };
  },
});

export const dribbbleGetMyShot = tool({
  description:
    'Return one shot owned by the connected user, including its media, tags, projects and attachments. Choose HTML or plain-text description representation.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    shotId: z.number().int().describe('ID of the shot owned by the connected user to retrieve.'),
    descriptionMediaType,
  }),
  execute: async ({ dribbbleToken, shotId, descriptionMediaType }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    return dribGet(dribbbleToken, `/shots/${shotId}`, {
      headers: { Accept: descriptionMediaType ?? HTML_MEDIA },
    });
  },
});

export const dribbbleListMyShots = tool({
  description:
    'Return one page of shots owned by the connected user, with a safe cursor for the next page and selectable HTML or plain-text description representation.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    perPage: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Maximum shots to return in this page (1-100, default 10).'),
    nextCursor: z
      .string()
      .optional()
      .describe('Continuation cursor from a previous call. Omit it to fetch the first page.'),
    descriptionMediaType,
  }),
  execute: async ({ dribbbleToken, perPage, nextCursor, descriptionMediaType }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const page = nextCursor !== undefined ? Number(nextCursor) : 1;
    if (!Number.isInteger(page) || page < 1) {
      return { error: 'nextCursor must be a cursor returned by a previous call.' };
    }
    const res = await dribRaw(dribbbleToken, 'GET', '/user/shots', {
      query: { page, per_page: perPage ?? 10 },
      headers: { Accept: descriptionMediaType ?? HTML_MEDIA },
    });
    if (res && typeof res === 'object' && 'error' in res && !('status' in res)) return res;
    const { status, headers, data } = res as { status: number; headers: Headers; data: unknown };
    if (status >= 400) return { error: `Dribbble API error ${status}`, details: data };
    const items = Array.isArray(data) ? data : [];
    const nextPage = nextPageFromLink(headers.get('link'));
    const hasMore = nextPage !== undefined ? true : items.length >= (perPage ?? 10);
    return {
      items,
      has_more: hasMore,
      next_cursor: (nextPage ?? (hasMore ? page + 1 : undefined))?.toString() ?? null,
    };
  },
});

export const dribbbleUpdateShot = tool({
  description:
    "Update an owned Dribbble shot's metadata (title, description, tags, team, scheduling) and choose the HTML or plain-text description representation returned in the response.",
  inputSchema: z.object({
    dribbbleToken: tokenField,
    shotId: z.number().int().describe('ID of the owned shot to update.'),
    title: z.string().optional().describe('Replacement title. Omit to preserve it.'),
    description: z.string().optional().describe('Replacement description. Omit to preserve it.'),
    tags: z
      .array(z.string())
      .max(12)
      .optional()
      .describe('Complete replacement list of up to 12 tags; [] clears all tags.'),
    teamId: z
      .number()
      .int()
      .optional()
      .describe('Team ID to associate; omit to preserve. Cannot be combined with removeTeam.'),
    removeTeam: z.boolean().optional().describe('Set true to remove the team association.'),
    lowProfile: z
      .boolean()
      .optional()
      .describe('Replacement visibility setting. Omit to preserve it.'),
    scheduledFor: z
      .string()
      .optional()
      .describe('New ISO 8601 publication time. Requires Pro or team capability.'),
    descriptionMediaType,
  }),
  execute: async ({
    dribbbleToken,
    shotId,
    title,
    description,
    tags,
    teamId,
    removeTeam,
    lowProfile,
    scheduledFor,
    descriptionMediaType,
  }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    if (teamId !== undefined && removeTeam === true) {
      return { error: 'removeTeam cannot be combined with team_id.' };
    }
    const body: Record<string, unknown> = {};
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    if (tags !== undefined) body.tags = tags;
    if (teamId !== undefined) body.team_id = teamId;
    else if (removeTeam === true) body.team_id = '';
    if (lowProfile !== undefined) body.low_profile = lowProfile;
    if (scheduledFor !== undefined) body.scheduled_for = scheduledFor;
    return dribPut(dribbbleToken, `/shots/${shotId}`, {
      body,
      headers: { Accept: descriptionMediaType ?? HTML_MEDIA },
    });
  },
});

export const dribbbleDeleteShot = tool({
  description:
    'Permanently delete a shot owned by the connected Dribbble user. This action is irreversible and returns the deleted shot ID as confirmation.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    shotId: z.number().int().describe('ID of the owned shot to permanently delete.'),
  }),
  execute: async ({ dribbbleToken, shotId }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const res = await dribDelete(dribbbleToken, `/shots/${shotId}`);
    if (res && typeof res === 'object' && 'error' in (res as Record<string, unknown>)) return res;
    return { deleted: true, shot_id: shotId };
  },
});
