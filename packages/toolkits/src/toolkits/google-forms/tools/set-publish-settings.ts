// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const setPublishSettings = tool({
    description:
        'Updates the publishing settings of a Google Form, controlling visibility and whether it accepts responses.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The ID of the form to update'),
        isPublished: z.boolean().describe('Whether the form is published and visible to others'),
        isAcceptingResponses: z.boolean().describe('Whether the form accepts responses'),
        updateMask: z
            .string()
            .optional()
            .describe("Optional fields to update, e.g. 'publishState' or '*' for all fields"),
    }),
    execute: async ({ googleFormsToken, formId, isPublished, isAcceptingResponses, updateMask }) => {
        try {
            const body: Record<string, unknown> = {
                publishSettings: {
                    publishState: {
                        isPublished,
                        isAcceptingResponses,
                    },
                },
            };
            if (updateMask) body.updateMask = updateMask;

            const result = await formsApiRequest(
                googleFormsToken,
                `/forms/${formId}:setPublishSettings`,
                { method: 'POST', body },
            );

            if (!result.ok) {
                return { error: 'Failed to set form publish settings', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error setting form publish settings',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
