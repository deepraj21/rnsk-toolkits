// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloUpdateBoardLabel = tool({
  description:
    'Renames or recolors an existing Trello board label, or moves it to another board. Pass only the fields you want to change.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    labelId: z.string().describe('Label id (from getBoardLabels)'),
    name: z.string().optional().describe('New label name'),
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
      .describe('New label color'),
    idBoard: z.string().optional().describe('Move the label to this board id'),
  }),
  execute: async ({ trelloCredentials, labelId, name, color, idBoard }) => {
    if (!labelId) return { error: 'labelId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/labels/${encodeURIComponent(labelId)}`,
      {
        method: 'PUT',
        query: { name, color, idBoard },
      },
    );
    if (result.error) return result;

    return result.data;
  },
});
