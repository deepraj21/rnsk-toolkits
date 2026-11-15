// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetDesignDataset = tool({
  description:
    'Returns the autofill dataset definition of a design: the data fields (text, image, chart, etc.) available for filling. Field names and types are exactly what canvaCreateDesignAutofillJob expects in its data object.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID (must contain autofill data fields)'),
  }),
  execute: async ({ canvaToken, designId }) => {
    if (!designId) return { error: 'designId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/designs/${encodeURIComponent(designId)}/dataset`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
