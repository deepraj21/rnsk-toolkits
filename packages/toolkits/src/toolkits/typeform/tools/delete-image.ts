// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformDeleteImage = tool({
  description:
    'Deletes an image from the account. Forms still referencing its URL will show a broken image — confirm with the user first. Needs the images:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    imageId: z.string().min(1).describe('Image ID to delete'),
  }),
  execute: async ({ typeformToken, imageId }) => {
    if (!imageId) return { error: 'imageId is required.' };

    const result = await typeformRequest(typeformToken, `/images/${encodeURIComponent(imageId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
