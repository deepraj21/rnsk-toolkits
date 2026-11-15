// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetBoardMembers = tool({
  description:
    'Lists the members of a Trello board with their role (admin, normal, observer). Use it to find member ids for assigning cards.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    boardId: z.string().describe('Board id or short link'),
    filter: z
      .enum(['all', 'admins', 'owners', 'normal', 'none'])
      .optional()
      .describe('Filter by membership type (default "all")'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated member fields, e.g. "username,fullName,initials"'),
  }),
  execute: async ({ trelloCredentials, boardId, filter, fields }) => {
    if (!boardId) return { error: 'boardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/boards/${encodeURIComponent(boardId)}/members`,
      { query: { filter, fields } },
    );
    if (result.error) return result;

    return { members: asList(result.data) };
  },
});
