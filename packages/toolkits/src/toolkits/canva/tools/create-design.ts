// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateDesign = tool({
  description:
    'Creates a new Canva design and returns it (id, title, edit/view URLs). Choose one mode: a preset design type (doc, presentation, whiteboard, email) optionally seeded with an asset_id, a copy of an existing design (copyDesignId), or a design from a brand template (brandTemplateId). Blank designs not edited within 7 days are auto-deleted by Canva.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designType: z
      .enum(['doc', 'email', 'presentation', 'whiteboard'])
      .optional()
      .describe('Preset design type for a new blank design'),
    assetId: z
      .string()
      .optional()
      .describe('Image asset ID to place in the new design (image assets only)'),
    copyDesignId: z
      .string()
      .optional()
      .describe('Existing design ID to copy instead of creating blank'),
    pageNumbers: z
      .array(z.number().int().min(1))
      .optional()
      .describe('1-based pages to copy (copyDesignId/brandTemplateId only; default all)'),
    brandTemplateId: z.string().optional().describe('Brand template ID to create the design from'),
    title: z.string().min(1).max(255).optional().describe('Design title (max 255 chars)'),
  }),
  execute: async ({
    canvaToken,
    designType,
    assetId,
    copyDesignId,
    pageNumbers,
    brandTemplateId,
    title,
  }) => {
    let body;
    if (copyDesignId) {
      body = compact({
        type: 'design',
        design_id: copyDesignId,
        page_numbers: pageNumbers,
      });
    } else if (brandTemplateId) {
      body = compact({
        type: 'brand_template',
        brand_template_id: brandTemplateId,
        page_numbers: pageNumbers,
      });
    } else if (designType || assetId) {
      body = compact({
        type: 'type_and_asset',
        design_type: designType ? { type: 'preset', name: designType } : undefined,
        asset_id: assetId,
        title,
      });
    } else {
      return {
        error:
          'Provide designType (or assetId) for a new design, copyDesignId to copy a design, or brandTemplateId to create from a brand template.',
      };
    }

    const result = await canvaRequest(canvaToken, '/designs', {
      method: 'POST',
      body,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
