// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { driveRequest, slidesRequest } from './utils.js';

export const presentationsGet = tool({
  description:
    'Retrieve a Google Slides presentation by ID or search for a presentation by name in Drive.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    presentationId: z.string().optional().describe('The ID of the presentation to retrieve'),
    presentationName: z
      .string()
      .optional()
      .describe('Presentation name to search for in Google Drive'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated field mask for a partial Slides API response'),
  }),
  execute: async ({ googleSlidesToken, presentationId, presentationName, fields }) => {
    try {
      let resolvedId = presentationId;

      if (!resolvedId && presentationName) {
        const escaped = presentationName.replace(/'/g, "\\'");
        const search = await driveRequest(googleSlidesToken, '/files', {
          query: {
            q: `name='${escaped}' and mimeType='application/vnd.google-apps.presentation' and trashed=false`,
            pageSize: 1,
            fields: 'files(id,name,webViewLink)',
          },
        });

        if (!search.ok) {
          return { error: 'Failed to search for presentation by name', details: search.data, statusCode: search.status };
        }

        resolvedId = search.data?.files?.[0]?.id;
        if (!resolvedId) {
          return { error: `No presentation found with name '${presentationName}'` };
        }
      }

      if (!resolvedId) {
        return { error: 'Provide presentationId or presentationName' };
      }

      const result = await slidesRequest(googleSlidesToken, `/presentations/${resolvedId}`, {
        query: fields ? { fields } : {},
      });

      if (!result.ok) {
        return { error: 'Failed to get presentation', details: result.data, statusCode: result.status };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error getting presentation',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
