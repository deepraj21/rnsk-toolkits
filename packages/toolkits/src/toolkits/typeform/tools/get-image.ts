// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetImage = tool({
  description:
    'Gets metadata for one image in the account — its URL, dimensions, and file details. Needs the images:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    imageId: z.string().min(1).describe('Image ID'),
  }),
  execute: async ({ typeformToken, imageId }) => {
    if (!imageId) return { error: 'imageId is required.' };

    const result = await typeformRequest(typeformToken, `/images/${encodeURIComponent(imageId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
