// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloDeleteLabel = tool({
  description:
    'Permanently deletes a label from a Trello board. Cards that already use the label lose it. This cannot be undone.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    labelId: z.string().describe('Label id to delete (from getBoardLabels)'),
  }),
  execute: async ({ trelloCredentials, labelId }) => {
    if (!labelId) return { error: 'labelId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/labels/${encodeURIComponent(labelId)}`,
      {
        method: 'DELETE',
      },
    );
    if (result.error) return result;

    return { deleted: true, labelId, result: result.data };
  },
});
