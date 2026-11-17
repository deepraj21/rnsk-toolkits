// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { compact, typeformRequest } from './client.js';

export const typeformCreateImage = tool({
  description:
    'Adds an image to the Typeform account so forms can reference it — either from a public URL or as base64-encoded data with a file name. Returns the new image’s URL in the Location field; use that URL in field/screen attachments. Needs the images:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    url: z.string().optional().describe('Public URL of the image to add'),
    image: z
      .string()
      .optional()
      .describe('Base64-encoded image data — raw base64 only, no data: prefix'),
    fileName: z.string().optional().describe('File name for the image, e.g. "hero.png"'),
    uploadSource: z
      .enum(['user_upload', 'stock_image', 'stock_icon', 'unknown'])
      .optional()
      .describe('Where the image came from (defaults to unknown)'),
  }),
  execute: async ({ typeformToken, url, image, fileName, uploadSource }) => {
    if (!url && !image) return { error: 'url or image (base64) is required.' };

    const body = compact({
      url,
      image,
      file_name: fileName,
      upload_source: uploadSource,
    });

    const result = await typeformRequest(typeformToken, '/images', { method: 'POST', body });
    if (result.error) return result;

    return result.data ?? {};
  },
});
