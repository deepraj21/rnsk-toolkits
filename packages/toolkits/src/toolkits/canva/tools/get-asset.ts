// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetAsset = tool({
  description:
    'Fetches metadata for one Canva asset by ID: name, type (image/video), tags, owner, timestamps, thumbnail, and dimensions. Use the asset ID returned by the asset upload jobs or canvaListFolderItems.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    assetId: z.string().min(1).describe('Asset ID, e.g. Msd59349ff'),
  }),
  execute: async ({ canvaToken, assetId }) => {
    if (!assetId) return { error: 'assetId is required.' };

    const result = await canvaRequest(canvaToken, `/assets/${encodeURIComponent(assetId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
