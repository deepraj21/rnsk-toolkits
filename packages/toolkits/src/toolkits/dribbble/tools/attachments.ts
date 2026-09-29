// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { decodeFileInput, dribDelete, dribRaw } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const dribbbleUploadShotAttachment = tool({
  description:
    'Upload a file attachment to an owned Dribbble shot asynchronously. Requires a Pro user, team, or team membership. Success only confirms acceptance; retrieve the shot later to discover the attachment ID.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    shotId: z
      .number()
      .int()
      .min(1)
      .describe('ID of the owned shot that will receive the attachment.'),
    file: z
      .record(z.any())
      .describe(
        'Attachment file as an object with filename (or name), base64 content in content_b64, and content_type. No larger than 10 MB.',
      ),
  }),
  execute: async ({ dribbbleToken, shotId, file }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const decoded = decodeFileInput(file);
    if ('error' in decoded) return decoded;
    if (decoded.buffer.length > 10 * 1024 * 1024) {
      return { error: 'Attachment exceeds the 10 MB Dribbble upload limit.' };
    }
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(decoded.buffer)], { type: decoded.contentType }),
      decoded.filename,
    );
    const res = await dribRaw(dribbbleToken, 'POST', `/shots/${shotId}/attachments`, { form });
    if (res && typeof res === 'object' && 'error' in res && !('status' in res)) return res;
    const { status, data } = res as { status: number; data: unknown };
    if (status !== 202) return { error: `Dribbble API error ${status}`, details: data };
    return { accepted: true, processing: true, shot_id: shotId };
  },
});

export const dribbbleDeleteShotAttachment = tool({
  description:
    'Permanently delete an attachment from a shot owned by the connected Dribbble user. This action is irreversible and returns both IDs as confirmation.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    shotId: z.number().int().describe('ID of the shot containing the attachment.'),
    attachmentId: z.number().int().describe('ID of the attachment to permanently delete.'),
  }),
  execute: async ({ dribbbleToken, shotId, attachmentId }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const res = await dribDelete(dribbbleToken, `/shots/${shotId}/attachments/${attachmentId}`);
    if (res && typeof res === 'object' && 'error' in (res as Record<string, unknown>)) return res;
    return { deleted: true, shot_id: shotId, attachment_id: attachmentId };
  },
});
