// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateUrlAssetUploadJob = tool({
  description:
    "Starts an async job that fetches an image/video from a public URL and uploads it into the user's Canva Uploads — no need to pass file bytes. Returns a job — poll canvaGetUrlAssetUploadJob until status is success to get the asset ID. The URL must be internet-accessible; rate limited to 30 per minute per user.",
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    name: z.string().min(1).max(255).describe('Asset name shown in Canva (max 255 chars)'),
    url: z
      .string()
      .min(8)
      .max(2048)
      .describe('Publicly accessible URL of the file to fetch, e.g. https://example.com/img.png'),
  }),
  execute: async ({ canvaToken, name, url }) => {
    if (!name) return { error: 'name is required.' };
    if (!url) return { error: 'url is required.' };

    const result = await canvaRequest(canvaToken, '/url-asset-uploads', {
      method: 'POST',
      body: compact({ name, url }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
