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
    'Asset operation: {create: {text_asset/callout_asset/structured_snippet_asset/sitelink_asset/lead_form_asset/promotion_asset/call_asset/price_asset/...}}, or {update: {...}, update_mask?}. Assets cannot be removed via API. Snake_case keys accepted.',
);

export const mutateAssets = tool({
    description:
        'Creates or updates Google Ads assets (sitelinks, snippets, text, lead forms, promotions, calls, prices, media). Use createCalloutAsset for validated immutable callouts. Assets cannot be removed — cleanup removes associations.',
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
            const result = await adsMutate(googleAdsToken, developerToken, 'assets', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate assets', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating assets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
