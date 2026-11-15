// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralGetFile = tool({
  description:
    'Gets metadata for one Mistral file by id — filename, purpose, size, mimetype, created time, and signature. Use mistralGetFileContent to read the bytes or mistralGetFileUrl for a temporary download link.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    fileId: z.string().min(1).describe('File id from mistralUploadFile / mistralListFiles'),
  }),
  execute: async ({ mistralToken, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await mistralRequest(mistralToken, `/files/${encodeURIComponent(fileId)}`);
    if (result.error) return result;

    return result.data;
  },
});
