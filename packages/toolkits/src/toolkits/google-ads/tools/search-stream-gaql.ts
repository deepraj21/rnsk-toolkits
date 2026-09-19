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

export const searchStreamGaql = tool({
    description:
        'Executes a GAQL query (SELECT ... FROM ... WHERE ...) and aggregates every streamed batch in order. Select only needed fields with WHERE and LIMIT for large reports.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        query: z.string().describe('GAQL query string, e.g. SELECT campaign.name FROM campaign LIMIT 50'),
        summaryRowSetting: z
            .enum(['UNSPECIFIED', 'NO_SUMMARY_ROW', 'SUMMARY_ROW_ONLY', 'SUMMARY_ROW_WITH_RESULTS'])
            .optional()
            .describe('Whether to include an aggregated summary row'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, query, summaryRowSetting, customerId, loginCustomerId }) => {
        try {
            if (!/^\s*select\s/i.test(query)) return { error: 'query must be a SELECT GAQL query' };
            const result = await adsSearchStream(googleAdsToken, developerToken, {
                customerId,
                loginCustomerId,
                query,
                summaryRowSetting,
            });
            if (!result.ok) return { error: 'Failed to execute GAQL query', details: result.error };
            const { rows, requestId, summaryRow } = collectStreamRows(result.data);
            return { results: rows, requestId, summaryRow };
        } catch (error) {
            return {
                error: 'Error executing GAQL query',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
