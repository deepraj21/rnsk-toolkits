// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cldSearch, cldSearchUpload, parseCreds } from './client.js';

const credField = z
  .string()
  .optional()
  .describe(
    'Injected Cloudinary credentials JSON {cloudName, apiKey, apiSecret} — match manifest tokenField',
  );

export const cloudinarySearchAssets = tool({
  description:
    'Search assets with Lucene-like expressions over type, tags, metadata, dates, and more.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    expression: z.string().optional().describe('Query, e.g. "resource_type:image AND tags:kitten"'),
    sortBy: z.array(z.record(z.string())).optional().describe('Sort, e.g. [{created_at:"desc"}]'),
    aggregate: z
      .array(z.record(z.any()))
      .optional()
      .describe('Aggregations for counts/ranges by field'),
    withField: z
      .array(z.string())
      .optional()
      .describe(
        'Extra fields: context, tags, image_metadata, metadata, quality_analysis, accessibility_analysis',
      ),
    fields: z
      .string()
      .optional()
      .describe(
        'Comma fields to return (overrides with_field); public_id/asset_id always included',
      ),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe('Max assets to return (default 50)'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({
    cloudinaryCredentials,
    expression,
    sortBy,
    aggregate,
    withField,
    fields,
    maxResults,
    nextCursor,
  }) =>
    cldSearch(parseCreds(cloudinaryCredentials), '/resources/search', {
      expression,
      sort_by: sortBy,
      aggregate,
      with_field: withField,
      fields,
      max_results: maxResults,
      next_cursor: nextCursor,
    }),
});

export const cloudinarySearchVisualAssets = tool({
  description:
    'Find visually similar images by example URL, existing asset ID, or text description.',
  inputSchema: z.object({
    cloudinaryCredentials: credField,
    imageUrl: z
      .string()
      .optional()
      .describe('Example image URL (exclusive with imageAssetId/text)'),
    imageAssetId: z.string().optional().describe('Existing Cloudinary image asset ID (exclusive)'),
    imageFileBase64: z
      .string()
      .optional()
      .describe('Example image bytes as base64/data URI (exclusive)'),
    imageFileName: z.string().optional().describe('File name for base64 uploads'),
    text: z
      .string()
      .optional()
      .describe('Semantic text query, e.g. "sunset over mountains" (exclusive)'),
    threshold: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe('Similarity threshold 0-1 (higher = more similar)'),
    maxResults: z.number().int().min(1).max(500).optional().describe('Max results (default 50)'),
    nextCursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({
    cloudinaryCredentials,
    imageUrl,
    imageAssetId,
    imageFileBase64,
    imageFileName,
    text,
    threshold,
    maxResults,
    nextCursor,
  }) => {
    const provided = [imageUrl, imageAssetId, imageFileBase64, text].filter((v) => v !== undefined);
    if (provided.length !== 1)
      return { error: 'Provide exactly one of imageUrl, imageAssetId, imageFileBase64, or text.' };
    if (imageFileBase64) {
      return cldSearchUpload(
        parseCreds(cloudinaryCredentials),
        {
          threshold,
          max_results: maxResults,
          next_cursor: nextCursor,
        },
        { fileName: imageFileName ?? 'query.bin', fileContentBase64: imageFileBase64 },
      );
    }
    return cldSearch(parseCreds(cloudinaryCredentials), '/resources/visual_search', {
      image_url: imageUrl,
      image_asset_id: imageAssetId,
      text,
      threshold,
      max_results: maxResults,
      next_cursor: nextCursor,
    });
  },
});
