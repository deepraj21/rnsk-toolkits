// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRaw, b64, toBuffer, compact } from './client.js';

export const canvaCreateAssetUploadJob = tool({
  description:
    "Starts an async job that uploads a file (image/video) into the user's Canva Uploads from raw bytes. Pass file content as utf8 text or base64 for binary; the name is sent base64-encoded in the Asset-Upload-Metadata header. Returns a job — poll canvaGetAssetUploadJob until status is success to get the asset ID for designs and autofill. Rate limited to 30 per minute per user.",
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    content: z.string().describe('File content as a string'),
    encoding: z
      .enum(['utf8', 'base64'])
      .optional()
      .describe('How to interpret content (default "utf8"; use "base64" for binary)'),
    name: z
      .string()
      .min(1)
      .max(50)
      .describe('Asset name shown in Canva (max 50 chars, e.g. "photo.png")'),
    mimeType: z
      .string()
      .optional()
      .describe('MIME type of the file, e.g. "image/png" (default application/octet-stream)'),
  }),
  execute: async ({ canvaToken, content, encoding, name, mimeType }) => {
    if (content === undefined || content === null || content === '')
      return { error: 'content is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await canvaRaw(canvaToken, '/asset-uploads', {
      body: toBuffer(content, encoding ?? 'utf8'),
      headers: {
        // Content-Type stays application/octet-stream (canvaRaw default);
        // the file's MIME type travels inside the metadata header.
        'Asset-Upload-Metadata': JSON.stringify(compact({ name_base64: b64(name) })),
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
