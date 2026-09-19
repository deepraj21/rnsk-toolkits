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
    normalizeCustomerId,
} from './client.js';

export const getCampaignById = tool({
    description:
        'Returns details of a Google Ads campaign by ID. Requires the correct customer_id — missing or mismatched IDs return empty results.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        id: z.string().describe('Numeric ID of the campaign to retrieve'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, id, customerId, loginCustomerId }) => {
        try {
            if (!/^\d+$/.test(id)) return { error: 'id must be a numeric campaign ID' };
            const cid = normalizeCustomerId(customerId);
            const result = await adsSearchStream(googleAdsToken, developerToken, {
                customerId,
                loginCustomerId,
                query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.advertising_channel_sub_type, campaign.start_date, campaign.end_date, campaign.campaign_budget, campaign.bidding_strategy, campaign.network_settings FROM campaign WHERE campaign.id = ${id} LIMIT 1`,
            });
            if (!result.ok) return { error: 'Failed to get campaign', details: result.error };
            const { rows, requestId } = collectStreamRows(result.data);
            void cid;
            return { result: rows[0] ?? {}, requestId };
        } catch (error) {
            return {
                error: 'Error getting campaign',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
