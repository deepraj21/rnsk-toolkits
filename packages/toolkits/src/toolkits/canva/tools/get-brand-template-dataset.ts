// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetBrandTemplateDataset = tool({
  description:
    'Returns the autofill dataset definition of a brand template: the data fields (text, image, chart, etc.) with their types. Field names are exactly what canvaCreateDesignAutofillJob expects in its data object for create_from_brand_template mode.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    brandTemplateId: z.string().min(1).describe('Brand template ID to inspect'),
  }),
  execute: async ({ canvaToken, brandTemplateId }) => {
    if (!brandTemplateId) return { error: 'brandTemplateId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/brand-templates/${encodeURIComponent(brandTemplateId)}/dataset`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
