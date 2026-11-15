// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateImageGenerationJob = tool({
  description:
    'Starts an AI image generation job and returns the job. idempotencyKey must be a fresh UUID (retries with the same key return the original job — keys held 24h). Choose aspect ratio and optionally a model (omit to let Canva pick); assetUpload "upload" saves the result as an asset in the user\'s Uploads, "none" only returns a download URL. Poll canvaGetImageGenerationJob until status is success. Requires the image_generation capability.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    idempotencyKey: z
      .string()
      .min(1)
      .describe('Fresh UUID for this request, e.g. 550e8400-e29b-41d4-a716-446655440000'),
    prompt: z
      .string()
      .min(1)
      .max(10000)
      .describe('Plain-text description of the image to generate (max 10000 chars)'),
    aspectRatio: z
      .enum([
        'square',
        'landscape',
        'portrait',
        'landscape_3_2',
        'portrait_2_3',
        'portrait_4_5',
        'landscape_4_3',
        'portrait_3_4',
      ])
      .optional()
      .describe('Output aspect ratio (default square)'),
    model: z
      .enum(['craft_v1_2k', 'lucid_origin', 'z_image_turbo'])
      .optional()
      .describe('Pin a specific model (omit to let Canva choose the best available)'),
    assetUpload: z
      .enum(['none', 'upload'])
      .optional()
      .describe(
        '"upload" saves the image as an asset in Uploads; "none" (default) only returns a download URL',
      ),
  }),
  execute: async ({ canvaToken, idempotencyKey, prompt, aspectRatio, model, assetUpload }) => {
    if (!idempotencyKey) return { error: 'idempotencyKey is required (a fresh UUID).' };
    if (!prompt) return { error: 'prompt is required.' };

    const result = await canvaRequest(canvaToken, '/image-generations', {
      method: 'POST',
      body: compact({
        idempotency_key: idempotencyKey,
        prompt,
        aspect_ratio: aspectRatio,
        model,
        asset_upload: assetUpload ? { type: assetUpload } : undefined,
      }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
