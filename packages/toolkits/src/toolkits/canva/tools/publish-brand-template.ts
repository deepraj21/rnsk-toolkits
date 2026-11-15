// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaPublishBrandTemplate = tool({
  description:
    'Publishes a Canva design as a brand template (or updates the existing template if the design is its draft) and returns the brand template with view/create URLs. The thumbnail may be null right after publishing — fetch it later with canvaGetBrandTemplate. Requires the brand_template capability.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z
      .string()
      .min(1)
      .describe('Design ID to publish (or the draft design of an existing template to update)'),
  }),
  execute: async ({ canvaToken, designId }) => {
    if (!designId) return { error: 'designId is required.' };

    const result = await canvaRequest(canvaToken, '/brand-templates', {
      method: 'POST',
      body: compact({ design_id: designId }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
