// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicGetFile = tool({
  description:
    'Gets metadata for one uploaded file by ID: filename, MIME type, size in bytes, creation time, purpose, and whether it can be downloaded.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    fileId: z.string().describe('File ID from uploadFile or listFiles'),
  }),
  execute: async ({ anthropicApiKey, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/files/${encodeURIComponent(fileId)}`,
    );
    if (result.error) return result;

    return result.data;
  },
});
