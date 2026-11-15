// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetUserCapabilities = tool({
  description:
    'Lists the API capabilities the connected user has (analytics, autofill, brand_template, design_generation, image_generation, resize, export_png_transparency, …). Check this before calling capability-gated tools to predict which ones will succeed.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
  }),
  execute: async ({ canvaToken }) => {
    const result = await canvaRequest(canvaToken, '/users/me/capabilities');
    if (result.error) return result;

    return result.data ?? {};
  },
});
