// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const createForm = tool({
    description:
        'Creates a new Google Form with the specified title. After creation, use batchUpdate to add questions and other items.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        title: z.string().describe('The visible title of the form shown to respondents'),
        description: z.string().optional().describe('Optional description text displayed with the form title'),
        documentTitle: z.string().optional().describe('Optional Drive-visible document title'),
        unpublished: z
            .boolean()
            .optional()
            .describe('Whether the form is unpublished and does not accept responses'),
    }),
    execute: async ({ googleFormsToken, title, description, documentTitle, unpublished }) => {
        try {
            const info: Record<string, string> = { title };
            if (description) info.description = description;
            if (documentTitle) info.documentTitle = documentTitle;

            const body: Record<string, unknown> = { info };
            if (unpublished !== undefined) body.unpublished = unpublished;

            const result = await formsApiRequest(googleFormsToken, '/forms', {
                method: 'POST',
                body,
            });

            if (!result.ok) {
                return { error: 'Failed to create form', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error creating form',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
