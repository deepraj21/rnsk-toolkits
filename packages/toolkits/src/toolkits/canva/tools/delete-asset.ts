// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaDeleteAsset = tool({
  description:
    "Deletes an asset from the user's Canva Uploads permanently. Designs that already embed the asset keep a flattened copy, but future autofill/jobs referencing this asset ID will fail. This is not undoable.",
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    assetId: z.string().min(1).describe('Asset ID to delete'),
  }),
  execute: async ({ canvaToken, assetId }) => {
    if (!assetId) return { error: 'assetId is required.' };

    const result = await canvaRequest(canvaToken, `/assets/${encodeURIComponent(assetId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, assetId, result: result.data ?? null };
  },
});
