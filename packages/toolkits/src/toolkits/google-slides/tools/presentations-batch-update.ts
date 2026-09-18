// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildMarkdownSlideRequests } from './markdown.js';
import { slidesRequest } from './utils.js';

export const presentationsBatchUpdate = tool({
  description:
    'Update a Google Slides presentation using raw Slides API batch requests or Markdown content.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    presentationId: z.string().describe('The ID of the presentation to update'),
    requests: z
      .array(z.record(z.unknown()))
      .optional()
      .describe('List of Google Slides batchUpdate request objects'),
    writeControl: z
      .record(z.unknown())
      .optional()
      .describe('Write control options such as requiredRevisionId'),
    markdown_text: z
      .string()
      .optional()
      .describe('Markdown content to add as new slides. Separate slides with \\n---\\n'),
  }),
  execute: async ({ googleSlidesToken, presentationId, requests, writeControl, markdown_text }) => {
    try {
      const batchRequests = [...(requests ?? [])];

      if (markdown_text) {
        const presentation = await slidesRequest(googleSlidesToken, `/presentations/${presentationId}`);
        const insertionIndex = presentation.data?.slides?.length ?? 0;
        batchRequests.push(
          ...buildMarkdownSlideRequests(markdown_text, {
            insertionIndex,
            idPrefix: 'batch',
          }),
        );
      }

      if (batchRequests.length === 0) {
        return { error: 'Provide requests and/or markdown_text to update the presentation' };
      }

      const body: Record<string, unknown> = { requests: batchRequests };
      if (writeControl) body.writeControl = writeControl;

      const result = await slidesRequest(
        googleSlidesToken,
        `/presentations/${presentationId}:batchUpdate`,
        {
          method: 'POST',
          body,
        },
      );

      if (!result.ok) {
        return { error: 'Failed to batch update presentation', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error batch updating presentation',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
