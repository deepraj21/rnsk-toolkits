// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetDesignExportFormats = tool({
  description:
    'Lists the export formats a design supports (pdf, jpg, png, svg, pptx, gif, mp4, html, csv) and the page numbers that work with each. Check this before starting an export job so the format matches the design.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID to inspect'),
  }),
  execute: async ({ canvaToken, designId }) => {
    if (!designId) return { error: 'designId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/designs/${encodeURIComponent(designId)}/export-formats`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
