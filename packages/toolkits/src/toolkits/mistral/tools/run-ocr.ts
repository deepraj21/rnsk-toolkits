// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralRunOcr = tool({
  description:
    'Runs OCR on a document and returns structured markdown/text of its contents, including extracted images and tables. Provide exactly one source: documentUrl (PDF/URL), imageUrl, or fileId (from mistralUploadFile). Page numbers start at 0.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    model: z
      .string()
      .optional()
      .describe(
        'OCR model ID, e.g. "mistral-ocr-latest" (defaults to the service model when omitted)',
      ),
    documentUrl: z
      .string()
      .optional()
      .describe('URL of the document to process (PDF, etc.) — one of documentUrl/imageUrl/fileId'),
    documentName: z
      .string()
      .optional()
      .describe('Filename of the document, when using documentUrl'),
    imageUrl: z
      .string()
      .optional()
      .describe('Image URL or data URI to process — one of documentUrl/imageUrl/fileId'),
    fileId: z
      .string()
      .optional()
      .describe(
        'File id previously uploaded with mistralUploadFile — one of documentUrl/imageUrl/fileId',
      ),
    pages: z
      .union([z.string(), z.array(z.number())])
      .optional()
      .describe(
        'Pages to process: an int array, or a string like "0,1,2" / "0-5" / "0,2-4" (0-indexed)',
      ),
    includeImageBase64: z
      .boolean()
      .optional()
      .describe('Include extracted images as base64 data URIs in the response'),
    imageLimit: z.number().min(1).optional().describe('Max images to extract'),
    imageMinSize: z.number().min(1).optional().describe('Min image dimension (px) to extract'),
    extractHeader: z.boolean().optional().describe('Extract header content'),
    extractFooter: z.boolean().optional().describe('Extract footer content'),
    includeBlocks: z.boolean().optional().describe('Return block-level layout information'),
  }),
  execute: async ({
    mistralToken,
    model,
    documentUrl,
    documentName,
    imageUrl,
    fileId,
    pages,
    includeImageBase64,
    imageLimit,
    imageMinSize,
    extractHeader,
    extractFooter,
    includeBlocks,
  }) => {
    const sources = [documentUrl, imageUrl, fileId].filter(Boolean);
    if (sources.length === 0) {
      return { error: 'One of documentUrl, imageUrl, or fileId is required.' };
    }
    if (sources.length > 1) {
      return { error: 'Provide only one of documentUrl, imageUrl, or fileId.' };
    }

    const document = documentUrl
      ? { type: 'document_url', document_url: documentUrl, document_name: documentName }
      : imageUrl
        ? { type: 'image_url', image_url: imageUrl }
        : { type: 'file', file_id: fileId };

    const result = await mistralRequest(mistralToken, '/ocr', {
      method: 'POST',
      body: compact({
        model: model ?? null,
        document,
        pages,
        include_image_base64: includeImageBase64,
        image_limit: imageLimit,
        image_min_size: imageMinSize,
        extract_header: extractHeader,
        extract_footer: extractFooter,
        include_blocks: includeBlocks,
      }),
    });
    if (result.error) return result;

    return result.data;
  },
});
