// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const renewWatch = tool({
    description:
        'Renews a watch on a Google Form, extending its expiration by one week from the time of renewal.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The ID of the form that contains the watch'),
        watchId: z.string().describe('The ID of the watch to renew'),
    }),
    execute: async ({ googleFormsToken, formId, watchId }) => {
        try {
            const result = await formsApiRequest(
                googleFormsToken,
                `/forms/${formId}/watches/${watchId}:renew`,
                { method: 'POST', body: {} },
            );

            if (!result.ok) {
                return { error: 'Failed to renew form watch', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error renewing form watch',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
