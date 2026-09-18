// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { driveRequest } from './utils.js';

export const presentationsCopyFromTemplate = tool({
  description:
    'Copy a Google Slides template presentation to create a new deck, optionally with a new title and destination folder.',
  inputSchema: z.object({
    googleSlidesToken: z.string().describe('The Google Slides access token'),
    template_presentation_id: z.string().describe('Drive file ID of the Slides template to copy'),
    new_title: z.string().optional().describe('Title for the copied presentation'),
    parent_folder_id: z.string().optional().describe('Destination Google Drive folder ID'),
  }),
  execute: async ({ googleSlidesToken, template_presentation_id, new_title, parent_folder_id }) => {
    try {
      const body: Record<string, unknown> = {};
      if (new_title) body.name = new_title;
      if (parent_folder_id) body.parents = [parent_folder_id];

      const result = await driveRequest(
        googleSlidesToken,
        `/files/${template_presentation_id}/copy`,
        {
          method: 'POST',
          body,
        },
      );

      if (!result.ok) {
        return { error: 'Failed to copy presentation template', details: result.data, statusCode: result.status };
      }

      return {
        presentationId: result.data?.id,
        name: result.data?.name,
        webViewLink: result.data?.webViewLink,
        ...result.data,
      };
    } catch (error) {
      return {
        error: 'Error copying presentation template',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
