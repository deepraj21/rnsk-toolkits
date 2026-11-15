// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetBrandTemplate = tool({
  description:
    'Fetches one brand template by ID: title, view/create URLs, thumbnail, and timestamps. Use its ID with canvaGetBrandTemplateDataset to discover autofill fields or canvaCreateDesignAutofillJob to generate designs from it.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    brandTemplateId: z.string().min(1).describe('Brand template ID, e.g. DEMzWSwy3BI'),
  }),
  execute: async ({ canvaToken, brandTemplateId }) => {
    if (!brandTemplateId) return { error: 'brandTemplateId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/brand-templates/${encodeURIComponent(brandTemplateId)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
