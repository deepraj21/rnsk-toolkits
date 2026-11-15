// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloGetBoard = tool({
  description:
    'Gets one Trello board by id or short link: name, description, workspace, permission level, label colors, and last activity.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    boardId: z.string().describe('Board id or short link (from the board URL, e.g. "dQHqCohZ")'),
    fields: z.string().optional().describe('Comma-separated board fields to return (default: all)'),
    boards: z
      .string()
      .optional()
      .describe('Nested resources: "members", "memberships", "labelNames", etc.'),
  }),
  execute: async ({ trelloCredentials, boardId, fields, boards }) => {
    if (!boardId) return { error: 'boardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/boards/${encodeURIComponent(boardId)}`,
      {
        query: { fields, boards },
      },
    );
    if (result.error) return result;

    return result.data;
  },
});
