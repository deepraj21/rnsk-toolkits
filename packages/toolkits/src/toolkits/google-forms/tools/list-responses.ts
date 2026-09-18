// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const listResponses = tool({
    description:
        'Lists all responses submitted to a Google Form with optional filtering and pagination.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The ID of the form whose responses to list'),
        filter: z
            .string()
            .optional()
            .describe("Optional filter expression, e.g. timestamp > 2024-01-15T00:00:00Z"),
        pageSize: z
            .number()
            .min(1)
            .max(5000)
            .optional()
            .describe('Maximum number of responses to return (default 5000)'),
        pageToken: z.string().optional().describe('Page token from a previous list response'),
    }),
    execute: async ({ googleFormsToken, formId, filter, pageSize, pageToken }) => {
        try {
            const result = await formsApiRequest(googleFormsToken, `/forms/${formId}/responses`, {
                searchParams: {
                    filter,
                    pageSize,
                    pageToken,
                },
            });

            if (!result.ok) {
                return { error: 'Failed to list form responses', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error listing form responses',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
