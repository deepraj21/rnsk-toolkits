// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralDeleteFile = tool({
  description:
    'Deletes a file from the Mistral workspace. This is permanent — files referenced by running batch jobs or fine-tunes may fail if deleted.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    fileId: z.string().min(1).describe('File id to delete'),
  }),
  execute: async ({ mistralToken, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await mistralRequest(mistralToken, `/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, fileId, result: result.data ?? null };
  },
});
