// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pinterestRequest, toPinterestError } from './client.js';

const tokenField = z
    .string()
    .optional()
    .describe('Injected Pinterest OAuth access token — match manifest tokenField');

export const getKeywordTrends = tool({
    description:
        'Get top growing, monthly, yearly, or seasonal Pinterest search keywords for a market, with time series and optional demographics.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        region: z
            .string()
            .describe('Market, e.g. "US", "CA", "GB+IE", "DE+AT+CH", "AU+NZ". Full list in description.'),
        trendType: z.enum(['growing', 'monthly', 'yearly', 'seasonal']).describe('Ranking timeframe'),
        interests: z.array(z.string()).optional().describe('Interest filters, e.g. ["beauty","home_decor"]'),
        genders: z.array(z.enum(['male', 'female', 'unknown'])).optional().describe('Gender filters'),
        ages: z
            .array(z.string())
            .optional()
            .describe('Age buckets, e.g. ["25-34","35-44"] of 18-24, 25-34, 35-44, 45-49, 50-54, 55-64, 65+'),
        includeKeywords: z
            .array(z.string())
            .max(50)
            .optional()
            .describe('Only trends including at least one term (max 50 terms)'),
        includeDemographics: z.boolean().optional().describe('Include age/gender volume distributions'),
        normalizeAgainstGroup: z.boolean().optional().describe('Normalize series against the group peak for comparison'),
        limit: z.number().int().min(1).max(50).optional().describe('Max trends, 1-50 (default 50)'),
    }),
    execute: async ({ pinterestToken, region, trendType, interests, genders, ages, includeKeywords, includeDemographics, normalizeAgainstGroup, limit }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/trends/keywords/${encodeURIComponent(region)}/top/${encodeURIComponent(trendType)}`,
                {
                    repeatQuery: {
                        ...(interests?.length ? { interests } : {}),
                        ...(genders?.length ? { genders } : {}),
                        ...(ages?.length ? { ages } : {}),
                        ...(includeKeywords?.length ? { include_keywords: includeKeywords } : {}),
                    },
                    query: {
                        include_demographics: includeDemographics,
                        normalize_against_group: normalizeAgainstGroup,
                        limit,
                    },
                },
            );
            if (!result.ok) return failedResult('Failed to get Pinterest keyword trends', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error getting Pinterest keyword trends');
        }
    },
});

export const getInspirationTrends = tool({
    description:
        'Get Pinterest editorial trend articles or featured trend topics for a region (US, GB+IE, CA).',
    inputSchema: z.object({
        pinterestToken: tokenField,
        trendSource: z
            .enum(['editorial_articles', 'featured_topics'])
            .describe('Feed: editorial_articles for published articles, featured_topics for topic groups'),
        region: z.enum(['US', 'GB+IE', 'CA']).describe('Market'),
        interest: z
            .string()
            .optional()
            .describe(
                'Interest for featured_topics, e.g. ALL, ANIMALS, ART, BEAUTY, DIY_AND_CRAFTS, FASHION, FOOD_AND_DRINKS, HOME_DECOR, TRAVEL, WEDDING. Leave ALL for editorial_articles.',
            ),
    }),
    execute: async ({ pinterestToken, trendSource, region, interest }) => {
        try {
            const path =
                trendSource === 'editorial_articles' ? '/trends/editorial_articles' : '/trends/topics/featured';
            const result = await pinterestRequest(pinterestToken, path, {
                query: { region, interest },
            });
            if (!result.ok) return failedResult('Failed to get Pinterest inspiration trends', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error getting Pinterest inspiration trends');
        }
    },
});

export const getProductTrends = tool({
    description:
        'Discover growing shopping categories (trending mode) or inspect trend metrics for leaf product categories (details mode) in US, GB+IE, or CA.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        mode: z.enum(['trending', 'details']).describe('trending discovers categories; details inspects given ones'),
        region: z.enum(['US', 'GB+IE', 'CA']).describe('Market'),
        productCategories: z
            .array(z.string())
            .max(20)
            .optional()
            .describe(
                'Required for details: 1-20 leaf category names from trending results, e.g. ["EYE_MAKEUP"]. Use the product_category string, not the numeric ID.',
            ),
        verticals: z
            .array(z.enum(['FASHION', 'HOME_DECOR', 'BEAUTY']))
            .optional()
            .describe('Trending-mode vertical filters'),
        genders: z
            .array(z.enum(['MALE', 'FEMALE', 'UNSPECIFIED']))
            .optional()
            .describe('Trending-mode gender filters'),
        ages: z.array(z.string()).optional().describe('Trending-mode age buckets, e.g. ["18-24","25-34"]'),
        engagementType: z
            .enum(['ENGAGEMENT', 'OUTBOUND_CLICK', 'SAVE'])
            .optional()
            .describe('Metric to analyze'),
        lookbackWindow: z
            .number()
            .int()
            .optional()
            .describe('Details-mode window: 90, 180, 365, or 730 days'),
    }),
    execute: async ({ pinterestToken, mode, region, productCategories, verticals, genders, ages, engagementType, lookbackWindow }) => {
        try {
            if (mode === 'details' && !productCategories?.length) {
                return { error: 'productCategories is required in details mode.' };
            }
            const path =
                mode === 'trending' ? '/trends/product_categories/trending' : '/trends/product_categories/details';
            const result = await pinterestRequest(pinterestToken, path, {
                repeatQuery: {
                    ...(verticals?.length ? { verticals } : {}),
                    ...(genders?.length ? { genders } : {}),
                    ...(ages?.length ? { ages } : {}),
                    ...(productCategories?.length ? { product_category: productCategories } : {}),
                },
                query: {
                    region,
                    engagement_type: engagementType,
                    lookback_window: lookbackWindow,
                },
            });
            if (!result.ok) return failedResult('Failed to get Pinterest product trends', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error getting Pinterest product trends');
        }
    },
});
