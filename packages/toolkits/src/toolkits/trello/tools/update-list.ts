// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloUpdateList = tool({
  description:
    'Updates a Trello list: rename it, move it within or across boards, reorder it (pos), or archive/restore it (closed). Pass only the fields you want to change.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    listId: z.string().describe('List id'),
    name: z.string().optional().describe('New list name'),
    closed: z.boolean().optional().describe('Archive (true) or restore (false) the list'),
    pos: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Position: "top", "bottom", or an absolute number'),
    idBoard: z.string().optional().describe('Move the list to this board id'),
    subscribed: z.boolean().optional().describe('Subscribe the member to the list'),
  }),
  execute: async ({ trelloCredentials, listId, name, closed, pos, idBoard, subscribed }) => {
    if (!listId) return { error: 'listId is required.' };

    const result = await trelloRequest(trelloCredentials, `/lists/${encodeURIComponent(listId)}`, {
      method: 'PUT',
      query: { name, closed, pos, idBoard, subscribed },
    });
    if (result.error) return result;

    return result.data;
  },
});
