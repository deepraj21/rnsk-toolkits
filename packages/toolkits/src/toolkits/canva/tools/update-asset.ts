// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaUpdateAsset = tool({
  description:
    'Updates a Canva asset: rename it and/or replace its tags (fields you omit are left unchanged; an empty tags array clears all tags). Tags are what users search by in the Canva UI. Returns the updated asset.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    assetId: z.string().min(1).describe('Asset ID to update'),
    name: z
      .string()
      .max(50)
      .optional()
      .describe('New asset name (max 50 chars; empty = unchanged)'),
    tags: z
      .array(z.string().max(50))
      .max(50)
      .optional()
      .describe('Replacement tag list (max 50 tags; omit to leave unchanged, [] to clear)'),
  }),
  execute: async ({ canvaToken, assetId, name, tags }) => {
    if (!assetId) return { error: 'assetId is required.' };
    if (name === undefined && tags === undefined)
      return { error: 'Provide name, tags, or both to update.' };

    const result = await canvaRequest(canvaToken, `/assets/${encodeURIComponent(assetId)}`, {
      method: 'PATCH',
      body: compact({ name, tags }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
