// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateDesignExportJob = tool({
  description:
    'Starts an export job for a Canva design (async) and returns the job with its ID and in_progress status. format.type selects the output: pdf, jpg, png, pptx, gif, mp4, csv, html_bundle, or html_standalone — plus format options like pages (1-based), size (a4/a3/letter/legal for docs), width/height (40-25000 px), quality, export_quality (regular/pro). Poll canvaGetDesignExportJob until status is success.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID to export'),
    format: z
      .record(z.any())
      .describe(
        'Export format object, e.g. { "type": "pdf", "pages": [1,2], "size": "a4" } or { "type": "png", "width": 1080 } or { "type": "mp4", "quality": "horizontal_1080p" }',
      ),
  }),
  execute: async ({ canvaToken, designId, format }) => {
    if (!designId) return { error: 'designId is required.' };
    if (!format || typeof format !== 'object' || !format.type)
      return {
        error:
          'format.type is required (pdf, jpg, png, pptx, gif, mp4, csv, html_bundle, or html_standalone).',
      };

    const result = await canvaRequest(canvaToken, '/exports', {
      method: 'POST',
      body: compact({ design_id: designId, format }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
