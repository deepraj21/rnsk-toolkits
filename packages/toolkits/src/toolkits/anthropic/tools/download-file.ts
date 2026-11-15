// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicDownloadFile = tool({
  description:
    'Downloads the contents of an uploaded file from the Anthropic Files API. Text files (txt, md, json, csv) come back as readable text; binary files (pdf, images) are returned as their decoded string representation.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    fileId: z.string().describe('File ID from uploadFile or listFiles'),
  }),
  execute: async ({ anthropicApiKey, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/files/${encodeURIComponent(fileId)}/content`,
    );
    if (result.error) return result;

    return { fileId, content: result.data };
  },
});
