// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const createWatch = tool({
    description:
        'Creates a watch on a Google Form to receive push notifications via Cloud Pub/Sub when form schema or responses change.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The ID of the form to watch'),
        eventType: z
            .enum(['EVENT_TYPE_UNSPECIFIED', 'SCHEMA', 'RESPONSES'])
            .describe('Type of event to watch for: SCHEMA or RESPONSES'),
        topicName: z
            .string()
            .describe('Fully qualified Cloud Pub/Sub topic name, e.g. projects/my-project/topics/my-topic'),
        watchId: z
            .string()
            .optional()
            .describe('Optional unique ID to assign to this watch (4-63 characters)'),
    }),
    execute: async ({ googleFormsToken, formId, eventType, topicName, watchId }) => {
        try {
            const body: Record<string, unknown> = {
                eventType,
                target: {
                    topic: { topicName },
                },
            };
            if (watchId) body.watchId = watchId;

            const result = await formsApiRequest(googleFormsToken, `/forms/${formId}/watches`, {
                method: 'POST',
                body,
            });

            if (!result.ok) {
                return { error: 'Failed to create form watch', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error creating form watch',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
