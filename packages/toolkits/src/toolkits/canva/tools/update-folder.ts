// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaUpdateFolder = tool({
  description:
    'Renames a Canva folder (the only mutable field is the name) and returns the updated folder. Use canvaGetFolder first if you need the current name.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    folderId: z.string().min(1).describe('Folder ID to rename'),
    name: z.string().min(1).max(255).describe('New folder name (max 255 chars)'),
  }),
  execute: async ({ canvaToken, folderId, name }) => {
    if (!folderId) return { error: 'folderId is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await canvaRequest(canvaToken, `/folders/${encodeURIComponent(folderId)}`, {
      method: 'PATCH',
      body: compact({ name }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
