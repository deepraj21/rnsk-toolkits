// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetDesign = tool({
  description:
    'Fetches full metadata for one Canva design by ID: title, owner, page count, design types, thumbnail, and edit/view URLs. Use the ID returned by canvaListDesigns or canvaCreateDesign.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID, e.g. DAFVztcvd9z'),
  }),
  execute: async ({ canvaToken, designId }) => {
    if (!designId) return { error: 'designId is required.' };

    const result = await canvaRequest(canvaToken, `/designs/${encodeURIComponent(designId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
