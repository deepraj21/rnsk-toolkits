// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const deleteWatch = tool({
    description: 'Deletes a watch from a Google Form, stopping push notifications for that watch.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The ID of the form that contains the watch'),
        watchId: z.string().describe('The ID of the watch to delete'),
    }),
    execute: async ({ googleFormsToken, formId, watchId }) => {
        try {
            const result = await formsApiRequest(
                googleFormsToken,
                `/forms/${formId}/watches/${watchId}`,
                { method: 'DELETE' },
            );

            if (!result.ok) {
                return { error: 'Failed to delete form watch', details: result.error };
            }

            return { success: true };
        } catch (error) {
            return {
                error: 'Error deleting form watch',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
