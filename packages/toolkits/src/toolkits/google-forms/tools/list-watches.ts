// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const listWatches = tool({
    description:
        'Lists all watches owned by the calling project for a specific Google Form, including status and expiration times.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The ID of the form whose watches to list'),
    }),
    execute: async ({ googleFormsToken, formId }) => {
        try {
            const result = await formsApiRequest(googleFormsToken, `/forms/${formId}/watches`);

            if (!result.ok) {
                return { error: 'Failed to list form watches', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error listing form watches',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
