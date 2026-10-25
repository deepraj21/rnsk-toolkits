// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, buildForm, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

const imageFileField = z
  .object({
    base64: z.string().describe('Raw base64 image bytes, or a data:image/...;base64,... URL'),
    filename: z.string().optional().describe('File name, e.g. input.png (default input.png)'),
    contentType: z.string().optional().describe('MIME type, default image/png'),
  })
  .describe('Source image as base64 (PNG). Use z.array of this shape for multi-image edits');

export const openaiGenerateImage = tool({
  description:
    'Generate an image from a text prompt with a GPT image or DALL-E model. Returns base64 image data (GPT image models) or a URL (dall-e models).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: z
      .string()
      .describe(
        'Image model: gpt-image-2, gpt-image-1.5, gpt-image-1-mini, chatgpt-image-latest, dall-e-3, or dall-e-2',
      ),
    prompt: z.string().describe('Image description, up to 32000 characters'),
    n: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe('Number of images to generate (default 1)'),
    size: z
      .string()
      .optional()
      .describe('Output size, e.g. 1024x1024, 1536x1024, 1024x1536, or auto'),
    quality: z
      .enum(['low', 'medium', 'high', 'xhigh', 'max', 'auto', 'standard', 'hd'])
      .optional()
      .describe('Generation quality (GPT image models: low/medium/high; dall-e-3: standard/hd)'),
    outputFormat: z
      .enum(['png', 'jpeg', 'webp'])
      .optional()
      .describe('Image format (GPT image models)'),
    background: z
      .enum(['transparent', 'opaque', 'auto'])
      .optional()
      .describe('Background mode (GPT image models)'),
    moderation: z.enum(['low', 'auto']).optional().describe('Content moderation strictness'),
    responseFormat: z
      .enum(['url', 'b64_json'])
      .optional()
      .describe('Legacy response format for dall-e models (GPT image models always return base64)'),
    user: z.string().optional().describe('End-user identifier for abuse monitoring'),
  }),
  execute: async ({
    openaiApiKey,
    model,
    prompt,
    n,
    size,
    quality,
    outputFormat,
    background,
    moderation,
    responseFormat,
    user,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/images/generations', {
        method: 'POST',
        body: {
          model,
          prompt,
          ...(n !== undefined ? { n } : {}),
          ...(size ? { size } : {}),
          ...(quality ? { quality } : {}),
          ...(outputFormat ? { output_format: outputFormat } : {}),
          ...(background ? { background } : {}),
          ...(moderation ? { moderation } : {}),
          ...(responseFormat ? { response_format: responseFormat } : {}),
          ...(user ? { user } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to generate image', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error generating image');
    }
  },
});

export const openaiEditImage = tool({
  description:
    'Edit or extend an image with a prompt: retouch, remove/replace objects, add elements, or restyle. Send the source image (and optionally a transparency mask) as base64; GPT image models accept up to 16 source images.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    prompt: z.string().describe('What to change in the image'),
    images: z
      .array(imageFileField)
      .min(1)
      .describe('Source image(s) as base64 (PNG, up to 16 for GPT image models)'),
    mask: imageFileField
      .optional()
      .describe('Optional alpha-mask PNG marking the transparent region to edit'),
    model: z.string().optional().describe('Model, e.g. gpt-image-2 (default) or gpt-image-1-mini'),
    n: z.number().int().min(1).max(10).optional().describe('Number of edited images'),
    size: z.string().optional().describe('Output size, e.g. 1024x1024'),
    quality: z.enum(['low', 'medium', 'high', 'auto']).optional().describe('Generation quality'),
    inputFidelity: z
      .enum(['low', 'high'])
      .optional()
      .describe('How strictly to preserve the source image (GPT image models)'),
    outputFormat: z.enum(['png', 'jpeg', 'webp']).optional().describe('Output image format'),
    background: z.enum(['transparent', 'opaque', 'auto']).optional().describe('Background mode'),
  }),
  execute: async ({
    openaiApiKey,
    prompt,
    images,
    mask,
    model,
    n,
    size,
    quality,
    inputFidelity,
    outputFormat,
    background,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const form = buildForm({
        prompt,
        image: images.map((image, index) => ({
          ...image,
          filename: image.filename ?? `image-${index + 1}.png`,
        })),
        ...(mask ? { mask } : {}),
        ...(model ? { model } : {}),
        ...(n !== undefined ? { n } : {}),
        ...(size ? { size } : {}),
        ...(quality ? { quality } : {}),
        ...(inputFidelity ? { input_fidelity: inputFidelity } : {}),
        ...(outputFormat ? { output_format: outputFormat } : {}),
        ...(background ? { background } : {}),
      });
      const result = await openaiRequest(openaiApiKey, '/images/edits', {
        method: 'POST',
        form,
      });
      if (!result.ok) return failedResult('Failed to edit image', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error editing image');
    }
  },
});
