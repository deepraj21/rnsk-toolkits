// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaMoveFolderItem = tool({
  description:
    'Moves a Canva item (design, folder, image asset, or brand template) into another folder. Use toFolderId "root" to move it to the top level of Projects. Returns 204 on success. Fails with item_in_multiple_folders if the item lives in several folders — move it via the Canva UI in that case.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    itemId: z.string().min(1).max(50).describe('ID of the item to move (video assets unsupported)'),
    toFolderId: z
      .string()
      .min(1)
      .max(50)
      .describe('Destination folder ID ("root" = Projects top level)'),
  }),
  execute: async ({ canvaToken, itemId, toFolderId }) => {
    if (!itemId) return { error: 'itemId is required.' };
    if (!toFolderId) return { error: 'toFolderId is required.' };

    const result = await canvaRequest(canvaToken, '/folders/move', {
      method: 'POST',
      body: compact({ item_id: itemId, to_folder_id: toFolderId }),
    });
    if (result.error) return result;

    return { moved: true, itemId, toFolderId, result: result.data ?? null };
  },
});
