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

export const getCustomerLists = tool({
    description:
        'Lists customer lists (UserList audience/remarketing segments, not accounts) in Google Ads. Review all results before picking one — names may be similar and list IDs differ from account IDs.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        pageToken: z.string().optional().describe('Pagination token from a previous nextPageToken'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, pageToken, customerId, loginCustomerId }) => {
        try {
            const cid = normalizeCustomerId(customerId);
            if (!cid) return { error: 'customerId is required' };
            const body: Record<string, unknown> = {
                query: 'SELECT user_list.id, user_list.name, user_list.description, user_list.resource_name FROM user_list',
            };
            if (pageToken) body.pageToken = pageToken;
            const result = await adsRequest(
                googleAdsToken,
                developerToken,
                `/${GOOGLE_ADS_API_VERSION}/customers/${cid}/googleAds:search`,
                { method: 'POST', body, loginCustomerId },
            );
            if (!result.ok) return { error: 'Failed to list customer lists', details: result.error };
            const data = result.data as {
                results?: Array<{ userList?: Record<string, unknown> }>;
                nextPageToken?: string;
            };
            return {
                userLists: (data.results ?? []).map((r) => r.userList).filter(Boolean),
                nextPageToken: data.nextPageToken,
            };
        } catch (error) {
            return {
                error: 'Error listing customer lists',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
