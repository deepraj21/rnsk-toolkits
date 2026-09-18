// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { formsApiRequest } from './utils.js';

export const batchUpdateForm = tool({
    description:
        'Applies a batch of update operations to a Google Form in a single atomic transaction. Use to add, update, or delete questions, modify form metadata, update settings, or reorganize items.',
    inputSchema: z.object({
        googleFormsToken: z.string().describe('The Google Forms access token'),
        formId: z.string().describe('The ID of the form to update'),
        requests: z
            .array(z.record(z.any()))
            .describe(
                'Update requests to apply. Each request contains one operation such as createItem, updateFormInfo, updateSettings, updateItem, moveItem, or deleteItem.',
            ),
        writeControl: z
            .object({
                targetRevisionId: z.string().optional(),
                requiredRevisionId: z.string().optional(),
            })
            .optional()
            .describe('Optional write control for optimistic concurrency'),
        includeFormInResponse: z
            .boolean()
            .optional()
            .describe('Whether to return the updated form in the response'),
    }),
    execute: async ({ googleFormsToken, formId, requests, writeControl, includeFormInResponse }) => {
        try {
            const body: Record<string, unknown> = { requests };
            if (writeControl) body.writeControl = writeControl;
            if (includeFormInResponse !== undefined) body.includeFormInResponse = includeFormInResponse;

            const result = await formsApiRequest(googleFormsToken, `/forms/${formId}:batchUpdate`, {
                method: 'POST',
                body,
            });

            if (!result.ok) {
                return { error: 'Failed to batch update form', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error batch updating form',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
