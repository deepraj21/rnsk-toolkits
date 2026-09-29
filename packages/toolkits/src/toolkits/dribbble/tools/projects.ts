// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dribDelete, dribGet, dribPost, dribPut, dribRaw, nextPageFromLink } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const dribbbleCreateProject = tool({
  description: 'Create a project for the connected Dribbble user to group related shots.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    name: z.string().min(1).describe('Name of the new project.'),
    description: z.string().optional().describe('Optional project description.'),
  }),
  execute: async ({ dribbbleToken, name, description }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const body: Record<string, unknown> = { name };
    if (description !== undefined) body.description = description;
    return dribPost(dribbbleToken, '/projects', { body });
  },
});

export const dribbbleListMyProjects = tool({
  description:
    'Return one page of projects belonging to the connected Dribbble user, with a safe cursor for the next page.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    perPage: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Maximum projects to return in this page (1-100, default 10).'),
    nextCursor: z
      .string()
      .optional()
      .describe('Continuation cursor from a previous call. Omit it to fetch the first page.'),
  }),
  execute: async ({ dribbbleToken, perPage, nextCursor }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const page = nextCursor !== undefined ? Number(nextCursor) : 1;
    if (!Number.isInteger(page) || page < 1) {
      return { error: 'nextCursor must be a cursor returned by a previous call.' };
    }
    const res = await dribRaw(dribbbleToken, 'GET', '/user/projects', {
      query: { page, per_page: perPage ?? 10 },
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

export const dribbbleUpdateProject = tool({
  description: 'Update the name or description of a project belonging to the connected user.',
  inputSchema: z.object({
    dribbbleToken: tokenField,
    projectId: z.number().int().describe('ID of the project to update.'),
    name: z.string().min(1).optional().describe('Replacement project name. Omit to preserve it.'),
    description: z
      .string()
      .optional()
      .describe('Replacement project description. Omit to preserve it.'),
  }),
  execute: async ({ dribbbleToken, projectId, name, description }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const body: Record<string, unknown> = {};
    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;
    return dribPut(dribbbleToken, `/projects/${projectId}`, { body });
  },
});

export const dribbbleDeleteProject = tool({
  description:
    "Permanently delete a project belonging to the connected Dribbble user. Returns deletion confirmation plus the provider's project fields.",
  inputSchema: z.object({
    dribbbleToken: tokenField,
    projectId: z.number().int().describe('ID of the project to permanently delete.'),
  }),
  execute: async ({ dribbbleToken, projectId }) => {
    if (!dribbbleToken) return { error: 'Dribbble token is required. Connect Dribbble first.' };
    const res = await dribDelete(dribbbleToken, `/projects/${projectId}`);
    if (res && typeof res === 'object' && 'error' in (res as Record<string, unknown>)) return res;
    const project = (res ?? {}) as Record<string, unknown>;
    return { deleted: true, project_id: projectId, ...project };
  },
});
