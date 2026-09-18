// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slidesRequest } from './utils.js';

export const presentationsPagesGetThumbnail = tool({
  description:
    'Get a thumbnail image URL for a slide page. Deprecated in favor of getPageThumbnail2; kept for compatibility.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    presentationId: z.string().describe('The ID of the presentation containing the page'),
    pageObjectId: z.string().describe('The object ID of the page whose thumbnail to retrieve'),
    'thumbnailProperties.mimeType': z
      .string()
      .optional()
      .describe("Optional thumbnail MIME type (currently only 'PNG' is supported)"),
    'thumbnailProperties.thumbnailSize': z
      .enum(['LARGE', 'MEDIUM', 'SMALL', 'THUMBNAIL_SIZE_UNSPECIFIED'])
      .optional()
      .describe('Optional thumbnail size'),
  }),
  execute: async ({
    googleSlidesToken,
    presentationId,
    pageObjectId,
    'thumbnailProperties.mimeType': mimeType,
    'thumbnailProperties.thumbnailSize': thumbnailSize,
  }) => {
    try {
      const query: Record<string, unknown> = {};
      if (mimeType) query['thumbnailProperties.mimeType'] = mimeType;
      if (thumbnailSize) query['thumbnailProperties.thumbnailSize'] = thumbnailSize;

      const result = await slidesRequest(
        googleSlidesToken,
        `/presentations/${presentationId}/pages/${pageObjectId}/thumbnail`,
        { query },
      );

      if (!result.ok) {
        return { error: 'Failed to get page thumbnail', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting page thumbnail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
