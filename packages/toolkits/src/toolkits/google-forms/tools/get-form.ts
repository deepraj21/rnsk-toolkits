// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const getForm = tool({
    description:
        'Retrieves the complete structure and metadata of a Google Form including title, description, items, settings, and publishing state.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The unique ID of the form to retrieve'),
    }),
    execute: async ({ googleFormsToken, formId }) => {
        try {
            const result = await formsApiRequest(googleFormsToken, `/forms/${formId}`);

            if (!result.ok) {
                return { error: 'Failed to get form', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error getting form',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
