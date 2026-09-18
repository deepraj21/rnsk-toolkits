// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slidesRequest } from './utils.js';

export const getPageThumbnail2 = tool({
  description:
    'Generate a thumbnail of the latest version of a specified slide page. Returns a preview image URL.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    presentationId: z.string().describe('The ID of the presentation'),
    pageObjectId: z.string().describe('The object ID of the page whose thumbnail to retrieve'),
    'thumbnailProperties.mimeType': z
      .string()
      .optional()
      .describe('Optional thumbnail MIME type (defaults to PNG)'),
    'thumbnailProperties.thumbnailSize': z
      .enum(['LARGE', 'MEDIUM', 'SMALL', 'THUMBNAIL_SIZE_UNSPECIFIED'])
      .optional()
      .describe('Optional thumbnail size (LARGE=1600px, MEDIUM=800px, SMALL=200px)'),
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
