// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloCreateCard = tool({
  description:
    'Creates a card in a Trello list. Provide idList (from getBoardLists) and a name; optionally a description, due date, start date, position, label ids, member ids, and a URL. The returned card id is needed for all other card tools.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    idList: z.string().describe('List id to create the card in'),
    name: z.string().describe('Card title'),
    desc: z.string().optional().describe('Card description (markdown supported)'),
    due: z.string().optional().describe('Due date, ISO 8601 e.g. "2026-12-01T17:00:00.000Z"'),
    start: z.string().optional().describe('Start date, ISO 8601'),
    dueComplete: z.boolean().optional().describe('Mark the due date complete at creation'),
    pos: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Position: "top", "bottom", or an absolute number'),
    idLabels: z.string().optional().describe('Comma-separated label ids to apply'),
    idMembers: z.string().optional().describe('Comma-separated member ids to assign'),
    urlSource: z.string().optional().describe('A URL to attach as the card link (http/https)'),
    top: z.boolean().optional().describe('Shorthand for pos=top'),
    bottom: z.boolean().optional().describe('Shorthand for pos=bottom'),
  }),
  execute: async ({
    trelloCredentials,
    idList,
    name,
    desc,
    due,
    start,
    dueComplete,
    pos,
    idLabels,
    idMembers,
    urlSource,
    top,
    bottom,
  }) => {
    if (!idList) return { error: 'idList is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await trelloRequest(trelloCredentials, '/cards', {
      method: 'POST',
      query: {
        idList,
        name,
        desc,
        due,
        start,
        dueComplete,
        pos,
        idLabels,
        idMembers,
        urlSource,
        top,
        bottom,
      },
    });
    if (result.error) return result;

    return result.data;
  },
});
