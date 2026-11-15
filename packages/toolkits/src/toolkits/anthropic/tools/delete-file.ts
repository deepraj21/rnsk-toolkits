// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicDeleteFile = tool({
  description:
    'Deletes a file you uploaded to the Anthropic workspace. The file can no longer be referenced in messages afterwards. Deleting is permanent.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    fileId: z.string().describe('File ID to delete'),
  }),
  execute: async ({ anthropicApiKey, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/files/${encodeURIComponent(fileId)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return result.data ?? { id: fileId, deleted: true };
  },
});
