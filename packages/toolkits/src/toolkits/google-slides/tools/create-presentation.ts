// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slidesRequest } from './utils.js';

export const createPresentation = tool({
  description:
    'Create a new Google Slides presentation with optional title, locale, page size, and custom presentation ID.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    title: z.string().optional().describe('The title of the presentation'),
    locale: z.string().optional().describe("Locale as IETF BCP 47 tag (e.g. 'en-US')"),
    pageSize: z.record(z.unknown()).optional().describe('Page size configuration object'),
    presentationId: z.string().optional().describe('Optional custom ID for the new presentation'),
  }),
  execute: async ({ googleSlidesToken, title, locale, pageSize, presentationId }) => {
    try {
      const body: Record<string, unknown> = {};
      if (title) body.title = title;
      if (locale) body.locale = locale;
      if (pageSize) body.pageSize = pageSize;
      if (presentationId) body.presentationId = presentationId;

      const result = await slidesRequest(googleSlidesToken, '/presentations', {
        method: 'POST',
        body,
      });

      if (!result.ok) {
        return { error: 'Failed to create presentation', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error creating presentation',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
