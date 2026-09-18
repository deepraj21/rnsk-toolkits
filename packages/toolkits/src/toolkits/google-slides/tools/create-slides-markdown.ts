// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildMarkdownSlideRequests, parseMarkdownSlides } from './markdown.js';
import { slidesRequest } from './utils.js';

export const createSlidesMarkdown = tool({
  description:
    'Creates a new Google Slides presentation from Markdown text. Splits content into slides using --- separators.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    title: z.string().describe('The title for the new Google Slides presentation'),
    markdown_text: z
      .string()
      .describe('Slide content in Markdown. Separate slides with \\n---\\n on its own line.'),
  }),
  execute: async ({ googleSlidesToken, title, markdown_text }) => {
    try {
      const createResult = await slidesRequest(googleSlidesToken, '/presentations', {
        method: 'POST',
        body: { title },
      });

      if (!createResult.ok) {
        return {
          error: 'Failed to create presentation',
          details: createResult.data,
          statusCode: createResult.status,
        };
      }

      const presentationId = createResult.data?.presentationId;
      const defaultSlideId = createResult.data?.slides?.[0]?.objectId;
      const slideSections = parseMarkdownSlides(markdown_text);

      if (!presentationId || slideSections.length === 0) {
        return {
          presentation_id: presentationId,
          slide_count: createResult.data?.slides?.length ?? 0,
          presentation: createResult.data,
        };
      }

      const requests: Array<Record<string, unknown>> = [];
      if (defaultSlideId) {
        requests.push({ deleteObject: { objectId: defaultSlideId } });
      }
      requests.push(...buildMarkdownSlideRequests(markdown_text, { insertionIndex: 0, idPrefix: 'new' }));

      const batchResult = await slidesRequest(
        googleSlidesToken,
        `/presentations/${presentationId}:batchUpdate`,
        {
          method: 'POST',
          body: { requests },
        },
      );

      if (!batchResult.ok) {
        return {
          error: 'Presentation created but failed to add markdown slides',
          presentation_id: presentationId,
          details: batchResult.data,
          statusCode: batchResult.status,
        };
      }

      return {
        presentation_id: presentationId,
        slide_count: slideSections.length,
        presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
        batchUpdate: batchResult.data,
      };
    } catch (error) {
      return {
        error: 'Error creating slides from markdown',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
