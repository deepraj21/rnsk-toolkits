// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, stackOverflowRequest, toStackOverflowError } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Optional Stack Apps API key (boosts quota). Do not ask the user for it.');
const siteField = z
  .string()
  .optional()
  .describe('Stack Exchange site, e.g. "stackoverflow" (default)');
const filterField = z.string().optional().describe('Result filter');

export const getSiteInfo = tool({
  description:
    'Get site statistics (total questions/answers/users) plus the current API quota for this key/IP. Call when quota errors appear.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
  }),
  execute: async ({ stackOverflowApiKey, site }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/info', {
        query: { site: site ?? 'stackoverflow' },
      });
      if (!result.ok) return failedResult('Failed to get Stack Overflow site info', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting Stack Overflow site info');
    }
  },
});

export const listSites = tool({
  description:
    'List all Stack Exchange network sites with URLs and API slugs. Use to pick a valid `site` value for other tools.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pagesize: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Results per page (default 500 for this method)'),
  }),
  execute: async ({ stackOverflowApiKey, page, pagesize }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/sites', {
        query: { page, pagesize },
      });
      if (!result.ok) return failedResult('Failed to list Stack Exchange sites', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error listing Stack Exchange sites');
    }
  },
});

export const getBadges = tool({
  description: 'List badges on a site, optionally filtered by name text.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    inname: z.string().optional().describe('Badge name text to match'),
    sort: z.enum(['rank', 'name', 'type']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pagesize: z.number().int().min(1).max(100).optional().describe('Results per page (default 30)'),
    filter: filterField,
  }),
  execute: async ({ stackOverflowApiKey, site, inname, sort, order, page, pagesize, filter }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/badges', {
        query: { site: site ?? 'stackoverflow', inname, sort, order, page, pagesize, filter },
      });
      if (!result.ok) return failedResult('Failed to get Stack Overflow badges', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting Stack Overflow badges');
    }
  },
});

export const getBadgeRecipients = tool({
  description: 'Get recent recipients of badge(s) by ID.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    badgeIds: z.string().describe('Badge IDs (max 100, semicolon-delimited)'),
    fromdate: z.number().int().optional().describe('Unix timestamp: only awards after this date'),
    todate: z.number().int().optional().describe('Unix timestamp: only awards before this date'),
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pagesize: z.number().int().min(1).max(100).optional().describe('Results per page (default 30)'),
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    badgeIds,
    fromdate,
    todate,
    page,
    pagesize,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/badges/${encodeURIComponent(badgeIds)}/recipients`,
        {
          query: { site: site ?? 'stackoverflow', fromdate, todate, page, pagesize, filter },
        },
      );
      if (!result.ok) return failedResult('Failed to get Stack Overflow badge recipients', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting Stack Overflow badge recipients');
    }
  },
});

export const createFilter = tool({
  description:
    'Create a custom result filter (include/exclude response fields) and get its ID for reuse. Useful to slim large question/answer payloads.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    include: z
      .array(z.string())
      .optional()
      .describe('Fields to include, e.g. ["question.body","answer.score"]'),
    exclude: z.array(z.string()).optional().describe('Fields to exclude'),
    base: z.string().optional().describe('Base filter: "default", "withbody", "none", or "total"'),
    unsafe: z.boolean().optional().describe('Allow unsafe (unescaped HTML) output (default false)'),
  }),
  execute: async ({ stackOverflowApiKey, include, exclude, base, unsafe }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/filters/create', {
        method: 'POST',
        body: { include, exclude, base, unsafe },
      });
      if (!result.ok) return failedResult('Failed to create Stack Overflow filter', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error creating Stack Overflow filter');
    }
  },
});
