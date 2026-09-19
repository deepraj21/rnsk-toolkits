// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    GOOGLE_ADS_API_VERSION,
    adsRequest,
    developerTokenField,
    googleAdsTokenField,
} from './client.js';

export const listAccessibleCustomers = tool({
    description:
        'Lists Google Ads customer resource names directly accessible to the authenticated OAuth user. Google ignores customer_id for this endpoint; for MCC child names and hierarchy use listSubAccounts.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
    }),
    execute: async ({ googleAdsToken, developerToken }) => {
        try {
            const result = await adsRequest(
                googleAdsToken,
                developerToken,
                `/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
            );
            if (!result.ok) return { error: 'Failed to list accessible customers', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error listing accessible customers',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
