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

const operationSchema = z.record(z.any()).describe(
    'CampaignAsset operation: {create: {campaign, asset, field_type, status}}, {update: {...}, update_mask?}, or {remove: resourceName}. Snake_case keys accepted.',
);

export const mutateCampaignAssets = tool({
    description:
        'Creates, updates, or removes links between assets and campaigns. Use after creating assets to attach sitelinks, callouts, snippets, and other asset types at campaign level.',
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
            const result = await adsMutate(googleAdsToken, developerToken, 'campaignAssets', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate campaign assets', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating campaign assets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
