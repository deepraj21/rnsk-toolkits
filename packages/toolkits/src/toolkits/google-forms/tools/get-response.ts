// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const getResponse = tool({
    description:
        'Retrieves a single form response by its unique response ID, including all answers, timestamps, and quiz scores.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The form ID to retrieve a response from'),
        responseId: z.string().describe('The unique identifier for a specific form submission'),
    }),
    execute: async ({ googleFormsToken, formId, responseId }) => {
        try {
            const result = await formsApiRequest(
                googleFormsToken,
                `/forms/${formId}/responses/${responseId}`,
            );

            if (!result.ok) {
                return { error: 'Failed to get form response', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error getting form response',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
