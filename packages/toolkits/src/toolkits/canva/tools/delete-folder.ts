// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaDeleteFolder = tool({
  description:
    'Deletes a Canva folder permanently (the folder and its contents are moved to trash/deleted — contents are not preserved separately). Cannot delete "root" or "uploads". This is not undoable from the API.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    folderId: z.string().min(1).describe('Folder ID to delete (not root/uploads)'),
  }),
  execute: async ({ canvaToken, folderId }) => {
    if (!folderId) return { error: 'folderId is required.' };
    if (folderId === 'root' || folderId === 'uploads')
      return { error: 'The root and uploads folders cannot be deleted.' };

    const result = await canvaRequest(canvaToken, `/folders/${encodeURIComponent(folderId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, folderId, result: result.data ?? null };
  },
});
