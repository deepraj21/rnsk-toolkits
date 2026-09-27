// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, stackOverflowRequest, toStackOverflowError } from './client.js';

const keyField = z
    .string()
    .optional()
    .describe('Optional Stack Apps API key (boosts quota). Do not ask the user for it.');
const siteField = z.string().optional().describe('Stack Exchange site, e.g. "stackoverflow" (default)');
const pageFields = {
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pagesize: z.number().int().min(1).max(100).optional().describe('Results per page, max 100 (default 30)'),
};
const dateFields = {
    fromdate: z.number().int().optional().describe('Unix timestamp: only items after this date'),
    todate: z.number().int().optional().describe('Unix timestamp: only items before this date'),
};
const filterField = z.string().optional().describe('Result filter');

export const searchTags = tool({
    description: 'Find tags by name text, sorted by popularity. Use to validate tag spellings before searching questions.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        inname: z.string().describe('Tag name text to match, e.g. "async"'),
        sort: z.enum(['popular', 'activity', 'name']).optional().describe('Sort field (default popular)'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        ...pageFields,
        ...dateFields,
        filter: filterField,
    }),
    execute: async ({ stackOverflowApiKey, site, inname, sort, order, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, '/tags', {
                query: { site: site ?? 'stackoverflow', inname, sort, order, page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to search Stack Overflow tags', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error searching Stack Overflow tags');
        }
    },
});

export const getTagInfo = tool({
    description: 'Get tag details: question counts, excerpt, synonyms. Accepts up to 100 semicolon-delimited tags.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        tags: z.string().describe('Tag names, e.g. "python" or "python;asyncio"'),
        sort: z.enum(['popular', 'activity', 'name']).optional().describe('Sort field'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        ...pageFields,
        ...dateFields,
        filter: filterField,
    }),
    execute: async ({ stackOverflowApiKey, site, tags, sort, order, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/tags/${encodeURIComponent(tags)}/info`, {
                query: { site: site ?? 'stackoverflow', sort, order, page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get Stack Overflow tag info', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting Stack Overflow tag info');
        }
    },
});

export const getTagWikis = tool({
    description: 'Get tag wiki excerpts and full bodies (usage guidance). Accepts up to 100 semicolon-delimited tags.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        tags: z.string().describe('Tag names, e.g. "typescript"'),
        ...pageFields,
        filter: filterField,
    }),
    execute: async ({ stackOverflowApiKey, site, tags, page, pagesize, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/tags/${encodeURIComponent(tags)}/wikis`, {
                query: { site: site ?? 'stackoverflow', page, pagesize, filter },
            });
            if (!result.ok) return failedResult('Failed to get Stack Overflow tag wikis', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting Stack Overflow tag wikis');
        }
    },
});

export const getTagRelated = tool({
    description: 'Get tags most correlated with a tag — great for expanding a search ("reactjs" → "redux", "webpack", ...).',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        tag: z.string().describe('Tag name, e.g. "kubernetes"'),
        ...pageFields,
        filter: filterField,
    }),
    execute: async ({ stackOverflowApiKey, site, tag, page, pagesize, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/tags/${encodeURIComponent(tag)}/related`, {
                query: { site: site ?? 'stackoverflow', page, pagesize, filter },
            });
            if (!result.ok) return failedResult('Failed to get related Stack Overflow tags', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting related Stack Overflow tags');
        }
    },
});

export const getTopAnswerers = tool({
    description: 'Get top answerers in a tag (all-time or last month) — find the experts worth following on a topic.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        tag: z.string().describe('Tag name, e.g. "rust"'),
        period: z.enum(['all_time', 'month']).optional().describe('Ranking period (default all_time)'),
        ...pageFields,
        filter: filterField,
    }),
    execute: async ({ stackOverflowApiKey, site, tag, period, page, pagesize, filter }) => {
        try {
            const result = await stackOverflowRequest(
                stackOverflowApiKey,
                `/tags/${encodeURIComponent(tag)}/top-answerers/${period ?? 'all_time'}`,
                { query: { site: site ?? 'stackoverflow', page, pagesize, filter } },
            );
            if (!result.ok) return failedResult('Failed to get top answerers for tag', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting top answerers for tag');
        }
    },
});

export const getTopAskers = tool({
    description: 'Get top askers in a tag (all-time or last month).',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        tag: z.string().describe('Tag name, e.g. "rust"'),
        period: z.enum(['all_time', 'month']).optional().describe('Ranking period (default all_time)'),
        ...pageFields,
        filter: filterField,
    }),
    execute: async ({ stackOverflowApiKey, site, tag, period, page, pagesize, filter }) => {
        try {
            const result = await stackOverflowRequest(
                stackOverflowApiKey,
                `/tags/${encodeURIComponent(tag)}/top-askers/${period ?? 'all_time'}`,
                { query: { site: site ?? 'stackoverflow', page, pagesize, filter } },
            );
            if (!result.ok) return failedResult('Failed to get top askers for tag', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting top askers for tag');
        }
    },
});

export const getTagSynonyms = tool({
    description: 'Get synonym mappings for tag(s), e.g. "js" → "javascript". Accepts up to 100 semicolon-delimited tags.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        tags: z.string().describe('Tag names, e.g. "js;ts"'),
        sort: z.enum(['creation', 'approval', 'applied']).optional().describe('Sort field'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        ...pageFields,
        ...dateFields,
        filter: filterField,
    }),
    execute: async ({ stackOverflowApiKey, site, tags, sort, order, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/tags/${encodeURIComponent(tags)}/synonyms`, {
                query: { site: site ?? 'stackoverflow', sort, order, page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get Stack Overflow tag synonyms', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting Stack Overflow tag synonyms');
        }
    },
});
