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

const REPORT_TEMPLATES: Record<string, { from: string; requiredColumns: string[] }> = {
    CUSTOMER: {
        from: 'customer',
        requiredColumns: ['customer.id', 'customer.descriptive_name', 'metrics.clicks', 'metrics.impressions', 'metrics.cost_micros', 'metrics.conversions'],
    },
    CAMPAIGN: {
        from: 'campaign',
        requiredColumns: ['campaign.id', 'campaign.name', 'campaign.status', 'metrics.clicks', 'metrics.impressions', 'metrics.cost_micros', 'metrics.conversions'],
    },
    AD_GROUP_AD: {
        from: 'ad_group_ad',
        requiredColumns: ['campaign.name', 'ad_group.name', 'ad_group_ad.ad.id', 'ad_group_ad.status', 'metrics.clicks', 'metrics.impressions', 'metrics.cost_micros', 'metrics.conversions'],
    },
    KEYWORD: {
        from: 'keyword_view',
        requiredColumns: ['campaign.name', 'ad_group.name', 'ad_group_criterion.keyword.text', 'ad_group_criterion.keyword.match_type', 'metrics.clicks', 'metrics.impressions', 'metrics.cost_micros', 'metrics.conversions'],
    },
    SEARCH_TERM: {
        from: 'search_term_view',
        requiredColumns: ['campaign.name', 'ad_group.name', 'search_term_view.search_term', 'metrics.clicks', 'metrics.impressions', 'metrics.cost_micros', 'metrics.conversions'],
    },
    DYNAMIC_SEARCH_AD_SEARCH_TERM: {
        from: 'dynamic_search_ads_search_term_view',
        requiredColumns: ['campaign.name', 'ad_group.name', 'dynamic_search_ads_search_term_view.search_term', 'dynamic_search_ads_search_term_view.headline', 'metrics.clicks', 'metrics.impressions', 'metrics.cost_micros', 'metrics.conversions'],
    },
    BIDDING_STRATEGY: {
        from: 'bidding_strategy',
        requiredColumns: ['bidding_strategy.id', 'bidding_strategy.name', 'bidding_strategy.type', 'metrics.clicks', 'metrics.impressions', 'metrics.cost_micros', 'metrics.conversions'],
    },
};

export const getRmfReport = tool({
    description:
        'Runs a bounded Google Ads report template (CUSTOMER, CAMPAIGN, AD_GROUP_AD, KEYWORD, SEARCH_TERM, DYNAMIC_SEARCH_AD_SEARCH_TERM, BIDDING_STRATEGY). Required columns are always selected; dates default to LAST_30_DAYS.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        report: z.enum(['CUSTOMER', 'CAMPAIGN', 'AD_GROUP_AD', 'KEYWORD', 'SEARCH_TERM', 'DYNAMIC_SEARCH_AD_SEARCH_TERM', 'BIDDING_STRATEGY']).describe('Report template to execute'),
        startDate: z.string().optional().describe('Inclusive start date YYYY-MM-DD'),
        endDate: z.string().optional().describe('Inclusive end date YYYY-MM-DD'),
        maxRows: z.number().min(1).max(10000).optional().describe('Maximum rows returned (default 1000)'),
        optionalMetrics: z.array(z.string()).optional().describe('Additional metrics such as metrics.ctr'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, report, startDate, endDate, maxRows, optionalMetrics, customerId, loginCustomerId }) => {
        try {
            const template = REPORT_TEMPLATES[report];
            if (!template) return { error: `Unknown report template: ${report}` };
            const columns = [...template.requiredColumns, ...(optionalMetrics ?? [])];
            const limit = maxRows ?? 1000;
            let dateRange: string;
            if (startDate || endDate) {
                if (!startDate || !endDate) return { error: 'startDate and endDate must both be provided' };
                if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                    return { error: 'Dates must be YYYY-MM-DD' };
                }
                dateRange = `segments.date BETWEEN '${startDate}' AND '${endDate}'`;
            } else {
                dateRange = 'segments.date DURING LAST_30_DAYS';
            }
            // One extra row detects truncation without silently dropping results.
            const query = `SELECT ${columns.join(', ')} FROM ${template.from} WHERE ${dateRange} LIMIT ${limit + 1}`;
            const result = await adsSearchStream(googleAdsToken, developerToken, {
                customerId,
                loginCustomerId,
                query,
            });
            if (!result.ok) return { error: 'Failed to run report', details: result.error };
            const { rows, requestId } = collectStreamRows(result.data);
            const truncated = rows.length > limit;
            return {
                report,
                dateRange: startDate ? `${startDate}..${endDate}` : 'LAST_30_DAYS',
                columns,
                requiredColumns: template.requiredColumns,
                optionalMetrics: optionalMetrics ?? [],
                results: truncated ? rows.slice(0, limit) : rows,
                truncated,
                requestId,
            };
        } catch (error) {
            return {
                error: 'Error running report',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
