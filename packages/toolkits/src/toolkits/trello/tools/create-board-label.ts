// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloCreateBoardLabel = tool({
  description:
    'Creates a new label on a Trello board with a name and color (green, yellow, orange, red, purple, blue, sky, lime, pink, black, or a null/none color). Returns the label id for tagging cards.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    idBoard: z.string().describe('Board id or short link to create the label on'),
    name: z.string().describe('Label name, e.g. "Blocked"'),
    color: z
      .enum([
        'green',
        'yellow',
        'orange',
        'red',
        'purple',
        'blue',
        'sky',
        'lime',
        'pink',
        'black',
        'null',
      ])
      .optional()
      .describe('Label color (default "null" = colorless)'),
  }),
  execute: async ({ trelloCredentials, idBoard, name, color }) => {
    if (!idBoard) return { error: 'idBoard is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await trelloRequest(trelloCredentials, '/labels', {
      method: 'POST',
      query: { idBoard, name, color },
    });
    if (result.error) return result;

    return result.data;
  },
});
