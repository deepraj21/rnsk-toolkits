// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloCreateList = tool({
  description:
    'Creates a new list (column) on a Trello board. Provide the board id and a name; pos controls placement ("top", "bottom", or a number).',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    name: z.string().describe('List name, e.g. "In Review"'),
    idBoard: z.string().describe('Board id or short link to create the list on'),
    pos: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Position: "top", "bottom", or an absolute number'),
    idListSource: z.string().optional().describe('Copy cards from this existing list id'),
  }),
  execute: async ({ trelloCredentials, name, idBoard, pos, idListSource }) => {
    if (!name) return { error: 'name is required.' };
    if (!idBoard) return { error: 'idBoard is required.' };

    const result = await trelloRequest(trelloCredentials, '/lists', {
      method: 'POST',
      query: { name, idBoard, pos, idListSource },
    });
    if (result.error) return result;

    return result.data;
  },
});
