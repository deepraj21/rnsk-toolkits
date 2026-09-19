// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    adsMutate,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
} from './client.js';

const operationSchema = z.object({
    create: z
        .object({
            asset: z.string().describe('Asset resource name customers/{id}/assets/{assetId}'),
            fieldType: z.string().describe('Asset field type, e.g. CALLOUT, SITELINK, STRUCTURED_SNIPPET'),
        })
        .optional(),
    remove: z
        .string()
        .optional()
        .describe('CustomerAsset resource name customers/{id}/customerAssets/{assetId}~{fieldType} (irreversible)'),
});

export const mutateCustomerAssets = tool({
    description:
        'Creates or removes customer-level asset associations (callouts, sitelinks, snippets across the account). Removal is irreversible; recreate to restore. Use after creating assets.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        operations: z.array(operationSchema).min(1),
        validateOnly: z.boolean().optional().describe('Validate without applying changes'),
        partialFailure: z.boolean().optional().describe('Valid ops succeed even if others fail'),
        responseContentType: z.enum(['RESOURCE_NAME_ONLY', 'MUTABLE_RESOURCE']).optional().describe('How much of each mutated resource to return'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, operations, validateOnly, partialFailure, responseContentType, customerId, loginCustomerId }) => {
        try {
            const result = await adsMutate(googleAdsToken, developerToken, 'customerAssets', {
                customerId,
                loginCustomerId,
                operations: operations as Array<Record<string, unknown>>,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate customer assets', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating customer assets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
