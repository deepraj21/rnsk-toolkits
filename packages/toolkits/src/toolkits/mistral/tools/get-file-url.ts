// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralGetFileUrl = tool({
  description:
    'Gets a temporary signed download URL for a Mistral file (expires after the given hours, default 24, max 168). Use this for large files instead of inlining content through mistralGetFileContent.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    fileId: z.string().min(1).describe('File id from mistralUploadFile / mistralListFiles'),
    expiry: z
      .number()
      .min(1)
      .max(168)
      .optional()
      .describe('Hours until the URL expires (1-168, default 24)'),
  }),
  execute: async ({ mistralToken, fileId, expiry }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await mistralRequest(mistralToken, `/files/${encodeURIComponent(fileId)}/url`, {
      query: { expiry },
    });
    if (result.error) return result;

    return result.data;
  },
});
