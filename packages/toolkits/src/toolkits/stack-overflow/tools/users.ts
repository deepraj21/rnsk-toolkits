// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { BODY_FILTER, failedResult, stackOverflowRequest, toStackOverflowError } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Optional Stack Apps API key (boosts quota). Do not ask the user for it.');
const siteField = z
  .string()
  .optional()
  .describe('Stack Exchange site, e.g. "stackoverflow" (default)');
const pageFields = {
  page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  pagesize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Results per page, max 100 (default 30)'),
};
const dateFields = {
  fromdate: z.number().int().optional().describe('Unix timestamp: only items after this date'),
  todate: z.number().int().optional().describe('Unix timestamp: only items before this date'),
};
const filterField = z.string().optional().describe('Result filter');

export const searchUsers = tool({
  description: 'Find users by display-name text. Use to resolve a username to a user ID.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    inname: z.string().describe('Display-name text to match, e.g. "Jon Skeet"'),
    sort: z
      .enum(['reputation', 'creation', 'name', 'modified'])
      .optional()
      .describe('Sort field (default reputation)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    inname,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/users', {
        query: {
          site: site ?? 'stackoverflow',
          inname,
          sort,
          order,
          page,
          pagesize,
          fromdate,
          todate,
          filter,
        },
      });
      if (!result.ok) return failedResult('Failed to search Stack Overflow users', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error searching Stack Overflow users');
    }
  },
});

export const getUser = tool({
  description:
    'Get user profile(s) by ID: reputation, badges, acceptance rate. Accepts up to 100 semicolon-delimited IDs.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    userIds: z.string().describe('User IDs, e.g. "22656" or "22656;12345"'),
    sort: z.enum(['reputation', 'creation', 'name', 'modified']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    userIds,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/users/${encodeURIComponent(userIds)}`,
        {
          query: {
            site: site ?? 'stackoverflow',
            sort,
            order,
            page,
            pagesize,
            fromdate,
            todate,
            filter,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to get Stack Overflow user', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting Stack Overflow user');
    }
  },
});

export const getUserQuestions = tool({
  description:
    "Get questions asked by user(s) — useful to judge someone's expertise or find their canonical posts.",
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    userIds: z.string().describe('User IDs (max 100, semicolon-delimited)'),
    sort: z.enum(['activity', 'votes', 'creation']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: z.string().optional().describe(`Result filter (pass "${BODY_FILTER}" for bodies)`),
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    userIds,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/users/${encodeURIComponent(userIds)}/questions`,
        {
          query: {
            site: site ?? 'stackoverflow',
            sort,
            order,
            page,
            pagesize,
            fromdate,
            todate,
            filter,
          },
        },
      );
      if (!result.ok) return failedResult("Failed to get user's Stack Overflow questions", result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, "Error getting user's Stack Overflow questions");
    }
  },
});

export const getUserAnswers = tool({
  description: 'Get answers posted by user(s), e.g. to find top answers by an expert.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    userIds: z.string().describe('User IDs (max 100, semicolon-delimited)'),
    sort: z.enum(['activity', 'votes', 'creation']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: z.string().optional().describe(`Result filter (pass "${BODY_FILTER}" for bodies)`),
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    userIds,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/users/${encodeURIComponent(userIds)}/answers`,
        {
          query: {
            site: site ?? 'stackoverflow',
            sort,
            order,
            page,
            pagesize,
            fromdate,
            todate,
            filter,
          },
        },
      );
      if (!result.ok) return failedResult("Failed to get user's Stack Overflow answers", result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, "Error getting user's Stack Overflow answers");
    }
  },
});

export const getUserTags = tool({
  description:
    "Get tags a user is active in, with scores — the fastest read on someone's areas of expertise.",
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    userIds: z.string().describe('User IDs (max 100, semicolon-delimited)'),
    sort: z.enum(['popular', 'activity', 'name']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    userIds,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/users/${encodeURIComponent(userIds)}/tags`,
        {
          query: {
            site: site ?? 'stackoverflow',
            sort,
            order,
            page,
            pagesize,
            fromdate,
            todate,
            filter,
          },
        },
      );
      if (!result.ok) return failedResult("Failed to get user's Stack Overflow tags", result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, "Error getting user's Stack Overflow tags");
    }
  },
});

export const getUserReputationHistory = tool({
  description: 'Get reputation-change history of user(s): bounties, accepts, upvotes over time.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    userIds: z.string().describe('User IDs (max 100, semicolon-delimited)'),
    ...pageFields,
    ...dateFields,
  }),
  execute: async ({ stackOverflowApiKey, site, userIds, page, pagesize, fromdate, todate }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/users/${encodeURIComponent(userIds)}/reputation`,
        {
          query: { site: site ?? 'stackoverflow', page, pagesize, fromdate, todate },
        },
      );
      if (!result.ok) return failedResult("Failed to get user's reputation history", result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, "Error getting user's reputation history");
    }
  },
});

export const getUserBadges = tool({
  description: 'Get badges earned by user(s).',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    userIds: z.string().describe('User IDs (max 100, semicolon-delimited)'),
    sort: z.enum(['rank', 'name', 'type']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    userIds,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/users/${encodeURIComponent(userIds)}/badges`,
        {
          query: {
            site: site ?? 'stackoverflow',
            sort,
            order,
            page,
            pagesize,
            fromdate,
            todate,
            filter,
          },
        },
      );
      if (!result.ok) return failedResult("Failed to get user's badges", result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, "Error getting user's badges");
    }
  },
});
