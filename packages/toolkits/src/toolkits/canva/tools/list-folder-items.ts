// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaListFolderItems = tool({
  description:
    'Lists the contents of a Canva folder: designs, subfolders, images, and brand templates (id, name/type, thumbnail). Use folderId "root" for the top level of Projects or "uploads" for the Uploads folder. Supports filtering by item type, sorting, pinned status, and continuation-token paging.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    folderId: z
      .string()
      .min(1)
      .describe('Folder ID ("root" = Projects top level, "uploads" = Uploads folder)'),
    continuation: z.string().optional().describe('Continuation token from a previous page'),
    limit: z.number().int().min(1).max(100).optional().describe('Page size, 1-100 (default 50)'),
    itemTypes: z
      .array(z.enum(['design', 'folder', 'image', 'brand_template']))
      .optional()
      .describe('Item types to return (default design, folder, image)'),
    sortBy: z
      .enum([
        'created_ascending',
        'created_descending',
        'modified_ascending',
        'modified_descending',
        'title_ascending',
        'title_descending',
      ])
      .optional()
      .describe('Sort order (default modified_descending)'),
    pinStatus: z
      .enum(['any', 'pinned'])
      .optional()
      .describe('Return all items or only pinned items (default any)'),
  }),
  execute: async ({ canvaToken, folderId, continuation, limit, itemTypes, sortBy, pinStatus }) => {
    if (!folderId) return { error: 'folderId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/folders/${encodeURIComponent(folderId)}/items`,
      {
        query: {
          continuation,
          limit,
          item_types: itemTypes && itemTypes.length ? itemTypes.join(',') : undefined,
          sort_by: sortBy,
          pin_status: pinStatus,
        },
      },
    );
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      items: Array.isArray(data.items) ? data.items : [],
      continuation: data.continuation ?? null,
    };
  },
});
