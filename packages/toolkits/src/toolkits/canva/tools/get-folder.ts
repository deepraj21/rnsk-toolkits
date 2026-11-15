// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetFolder = tool({
  description:
    'Fetches metadata for one Canva folder by ID: name, parent folder, and created/updated timestamps. Use with canvaListFolderItems to browse folder structure.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    folderId: z.string().min(1).describe('Folder ID to fetch'),
  }),
  execute: async ({ canvaToken, folderId }) => {
    if (!folderId) return { error: 'folderId is required.' };

    const result = await canvaRequest(canvaToken, `/folders/${encodeURIComponent(folderId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
