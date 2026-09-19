// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    GOOGLE_ADS_API_VERSION,
    adsRequest,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
    normalizeCustomerId,
} from './client.js';

export const getConversionActionTagSnippets = tool({
    description:
        'Retrieves provider-generated website or call conversion tag snippets for a conversion action. Use after creating a conversion action, before installing tags.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        conversionActionId: z.string().regex(/^\d+$/).describe('Numeric conversion action ID'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, conversionActionId, customerId, loginCustomerId }) => {
        try {
            const cid = normalizeCustomerId(customerId);
            if (!cid) return { error: 'customerId is required' };
            const result = await adsRequest(
                googleAdsToken,
                developerToken,
                `/${GOOGLE_ADS_API_VERSION}/customers/${cid}/conversionActions/${conversionActionId}`,
                { loginCustomerId },
            );
            if (!result.ok) {
                return { error: 'Failed to get conversion action tag snippets', details: result.error };
            }
            return { conversionAction: result.data };
        } catch (error) {
            return {
                error: 'Error getting conversion action tag snippets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
