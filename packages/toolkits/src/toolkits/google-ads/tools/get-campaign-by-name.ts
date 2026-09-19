// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    adsSearchStream,
    collectStreamRows,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
} from './client.js';

export const getCampaignByName = tool({
    description:
        'Retrieves a Google Ads campaign by its exact name using GAQL equality. Requires an active connection with valid customer_id.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        name: z.string().describe('Exact campaign name to match'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, name, customerId, loginCustomerId }) => {
        try {
            if (/['"\\\0\n\r]/.test(name)) {
                return { error: 'name contains characters that cannot be embedded in a GAQL literal' };
            }
            const result = await adsSearchStream(googleAdsToken, developerToken, {
                customerId,
                loginCustomerId,
                query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.start_date, campaign.end_date, campaign.campaign_budget, campaign.network_settings FROM campaign WHERE campaign.name = '${name}' LIMIT 1`,
            });
            if (!result.ok) return { error: 'Failed to get campaign', details: result.error };
            const { rows, requestId } = collectStreamRows(result.data);
            return { result: rows[0] ?? {}, requestId };
        } catch (error) {
            return {
                error: 'Error getting campaign',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
