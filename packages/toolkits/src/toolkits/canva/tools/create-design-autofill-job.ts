// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateDesignAutofillJob = tool({
  description:
    'Starts an async autofill job that fills data fields in a design (text, images, charts) and returns the job. Three modes: create_from_brand_template (brandTemplateId) builds a new design from a brand template; create_from_design (designId) makes a new filled copy of a design; update_design (designId) edits the existing design in place. data maps field names to values ({ type: "text", text } | { type: "image", asset_id } | { type: "chart", chart_data }) — get field names from canvaGetBrandTemplateDataset or canvaGetDesignDataset. Poll canvaGetDesignAutofillJob until success.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    mode: z
      .enum(['create_from_brand_template', 'create_from_design', 'update_design'])
      .optional()
      .describe(
        'Autofill mode (default: create_from_brand_template when brandTemplateId given, otherwise update_design)',
      ),
    brandTemplateId: z
      .string()
      .optional()
      .describe('Brand template ID (create_from_brand_template mode)'),
    designId: z
      .string()
      .optional()
      .describe('Design ID: the source for create_from_design, the target for update_design'),
    title: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .describe('Title for the newly created design (create modes only)'),
    data: z
      .record(z.any())
      .describe(
        'Field values keyed by dataset field name, e.g. { "headline": { "type": "text", "text": "Hello" }, "photo": { "type": "image", "asset_id": "Msd59349ff" } }',
      ),
  }),
  execute: async ({ canvaToken, mode, brandTemplateId, designId, title, data }) => {
    if (!data || typeof data !== 'object' || !Object.keys(data).length)
      return { error: 'data is required (field name → value map).' };

    const resolvedMode =
      mode ?? (brandTemplateId ? 'create_from_brand_template' : designId ? 'update_design' : null);
    if (!resolvedMode)
      return { error: 'Provide brandTemplateId or designId (plus data) to autofill.' };

    let body;
    if (resolvedMode === 'create_from_brand_template') {
      if (!brandTemplateId)
        return { error: 'brandTemplateId is required for create_from_brand_template.' };
      body = compact({
        type: resolvedMode,
        brand_template_id: brandTemplateId,
        title,
        data,
      });
    } else if (resolvedMode === 'create_from_design') {
      if (!designId) return { error: 'designId is required for create_from_design.' };
      body = compact({ type: resolvedMode, design_id: designId, title, data });
    } else {
      if (!designId) return { error: 'designId is required for update_design.' };
      body = compact({ type: resolvedMode, design_id: designId, data });
    }

    const result = await canvaRequest(canvaToken, '/autofills', {
      method: 'POST',
      body,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
