// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    GOOGLE_ADS_API_VERSION,
    adsMutate,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
} from './client.js';

const operationSchema = z.record(z.any()).describe(
    'AdGroupAd operation: {create: {...}} for responsive search ads (ad_group, status, ad with responsive_search_ad headlines/descriptions and final_urls), {update: {...}, update_mask?}, or {remove: resourceName}. Snake_case keys accepted.',
);

export const mutateAdGroupAds = tool({
    description:
        'Creates, updates, or removes ads in ad groups, including responsive search ads. Use after campaigns, budgets, ad groups, and keywords exist so the ad group has serving creative.',
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
            const result = await adsMutate(googleAdsToken, developerToken, 'adGroupAds', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate ad group ads', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating ad group ads',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
