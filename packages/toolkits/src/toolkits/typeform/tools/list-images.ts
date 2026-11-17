// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListImages = tool({
  description:
    'Lists the images in the Typeform account — the reusable assets that form fields, screens, and themes reference by URL. Needs the images:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
  }),
  execute: async ({ typeformToken }) => {
    const result = await typeformRequest(typeformToken, '/images');
    if (result.error) return result;

    return result.data ?? {};
  },
});
