// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloListBoards = tool({
  description:
    'Lists the Trello boards the authenticated member belongs to. Filter by state (open, closed, all, starred, or public). Returns each board’s id, name, description, url, and workspace — use the board id for all other board, list, and card tools.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    filter: z
      .enum(['all', 'closed', 'open', 'starred', 'public'])
      .optional()
      .describe('Which boards to return (default "open")'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated board fields, e.g. "name,desc,url,dateLastActivity"'),
    organization: z
      .boolean()
      .optional()
      .describe('Also return boards the member can see but is not a member of'),
  }),
  execute: async ({ trelloCredentials, filter, fields, organization }) => {
    const result = await trelloRequest(trelloCredentials, '/members/me/boards', {
      query: { filter, fields, organization },
    });
    if (result.error) return result;

    return { boards: asList(result.data) };
  },
});
