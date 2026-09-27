// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { BODY_FILTER, failedResult, stackOverflowRequest, toStackOverflowError } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe(
    'Optional Stack Apps API key (boosts quota from 300 to 10,000 requests/day). Do not ask the user for it.',
  );
const siteField = z
  .string()
  .optional()
  .describe(
    'Stack Exchange site, e.g. "stackoverflow" (default), "serverfault", "superuser", "askubuntu"',
  );
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
const filterField = z
  .string()
  .optional()
  .describe(
    'Result filter: "default", "withbody" (includes rendered HTML bodies), or a custom filter id from createFilter',
  );

export const searchQuestions = tool({
  description:
    'Advanced search over Stack Overflow questions: free text, tags, title/body text, vote/answer/view minimums, accepted/closed/wiki status and owner. Start here for "how do I ..." lookups.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    q: z
      .string()
      .optional()
      .describe('Free-form query text matched against all question properties'),
    tagged: z.string().optional().describe('Semicolon-delimited tags, e.g. "python;asyncio"'),
    nottagged: z.string().optional().describe('Semicolon-delimited tags to exclude'),
    title: z.string().optional().describe('Text that must appear in the title'),
    body: z.string().optional().describe('Text that must appear in the body'),
    user: z.number().int().optional().describe('Owner user id that questions must belong to'),
    answers: z.number().int().optional().describe('Minimum number of answers'),
    views: z.number().int().optional().describe('Minimum number of views'),
    accepted: z
      .boolean()
      .optional()
      .describe('Only questions with (true) or without (false) accepted answers'),
    closed: z.boolean().optional().describe('Only closed (true) or open (false) questions'),
    wiki: z
      .boolean()
      .optional()
      .describe('Only community-wiki (true) or non-wiki (false) questions'),
    url: z.string().optional().describe('URL that must be contained in a post (may include *)'),
    sort: z
      .enum(['activity', 'votes', 'creation', 'relevance'])
      .optional()
      .describe('Sort field (default activity)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction (default desc)'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    q,
    tagged,
    nottagged,
    title,
    body,
    user,
    answers,
    views,
    accepted,
    closed,
    wiki,
    url,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/search/advanced', {
        query: {
          site: site ?? 'stackoverflow',
          q,
          tagged,
          nottagged,
          title,
          body,
          user,
          answers,
          views,
          accepted,
          closed,
          wiki,
          url,
          sort,
          order,
          page,
          pagesize,
          fromdate,
          todate,
          filter,
        },
      });
      if (!result.ok) return failedResult('Failed to search Stack Overflow questions', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error searching Stack Overflow questions');
    }
  },
});

export const searchQuestionsByTitle = tool({
  description:
    'Search questions by title text (intitle). Lighter-weight than advanced search when only a title phrase is known.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    intitle: z.string().describe('Title text to search for, e.g. "panic: runtime error"'),
    tagged: z.string().optional().describe('Semicolon-delimited tags to restrict to'),
    nottagged: z.string().optional().describe('Semicolon-delimited tags to exclude'),
    sort: z.enum(['activity', 'votes', 'creation', 'relevance']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    intitle,
    tagged,
    nottagged,
    sort,
    order,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/search', {
        query: {
          site: site ?? 'stackoverflow',
          intitle,
          tagged,
          nottagged,
          sort,
          order,
          page,
          pagesize,
          fromdate,
          todate,
          filter,
        },
      });
      if (!result.ok) return failedResult('Failed to search Stack Overflow by title', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error searching Stack Overflow by title');
    }
  },
});

export const getSimilarQuestions = tool({
  description:
    'Find questions similar to a (possibly not-yet-asked) title. Useful to check for duplicates before asking.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    title: z.string().describe('Draft title to find similar questions for'),
    tagged: z.string().optional().describe('Semicolon-delimited tags to restrict to'),
    nottagged: z.string().optional().describe('Semicolon-delimited tags to exclude'),
    sort: z.enum(['activity', 'votes', 'creation', 'relevance']).optional().describe('Sort field'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    title,
    tagged,
    nottagged,
    sort,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/similar', {
        query: {
          site: site ?? 'stackoverflow',
          title,
          tagged,
          nottagged,
          sort,
          page,
          pagesize,
          fromdate,
          todate,
          filter,
        },
      });
      if (!result.ok)
        return failedResult('Failed to find similar Stack Overflow questions', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error finding similar Stack Overflow questions');
    }
  },
});

export const getQuestions = tool({
  description:
    'Browse questions: hot, week/month rankings, or filtered by tag and dates. Use for trending-topic discovery.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    sort: z
      .enum(['activity', 'votes', 'creation', 'hot', 'week', 'month'])
      .optional()
      .describe('Sort field (default activity)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    tagged: z.string().optional().describe('Semicolon-delimited tags, e.g. "typescript;node.js"'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    sort,
    order,
    tagged,
    page,
    pagesize,
    fromdate,
    todate,
    filter,
  }) => {
    try {
      const result = await stackOverflowRequest(stackOverflowApiKey, '/questions', {
        query: {
          site: site ?? 'stackoverflow',
          sort,
          order,
          tagged,
          page,
          pagesize,
          fromdate,
          todate,
          filter,
        },
      });
      if (!result.ok) return failedResult('Failed to get Stack Overflow questions', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting Stack Overflow questions');
    }
  },
});

export const getQuestion = tool({
  description:
    'Get full question(s) by ID, including body with filter=withbody. Accepts up to 100 semicolon-delimited IDs.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    questionIds: z.string().describe('Question IDs, e.g. "12345" or "123;456" (max 100)'),
    sort: z.enum(['activity', 'votes', 'creation']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: z
      .string()
      .optional()
      .describe(`Result filter (default excludes bodies; pass "${BODY_FILTER}" for bodies)`),
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    questionIds,
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
        `/questions/${encodeURIComponent(questionIds)}`,
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
      if (!result.ok) return failedResult('Failed to get Stack Overflow question', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting Stack Overflow question');
    }
  },
});

export const getQuestionAnswers = tool({
  description:
    'Get answers on question(s), optionally with bodies. Sort by votes to surface the accepted/best answer first.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    questionIds: z.string().describe('Question IDs, e.g. "12345" (max 100, semicolon-delimited)'),
    sort: z
      .enum(['activity', 'votes', 'creation'])
      .optional()
      .describe('Sort field (default activity)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: z
      .string()
      .optional()
      .describe(`Result filter (pass "${BODY_FILTER}" for answer bodies)`),
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    questionIds,
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
        `/questions/${encodeURIComponent(questionIds)}/answers`,
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
      if (!result.ok)
        return failedResult('Failed to get answers for Stack Overflow question', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting answers for Stack Overflow question');
    }
  },
});

export const getQuestionComments = tool({
  description: 'Get comments on question(s).',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    questionIds: z.string().describe('Question IDs (max 100, semicolon-delimited)'),
    sort: z.enum(['creation', 'votes']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    questionIds,
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
        `/questions/${encodeURIComponent(questionIds)}/comments`,
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
      if (!result.ok)
        return failedResult('Failed to get comments for Stack Overflow question', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting comments for Stack Overflow question');
    }
  },
});

export const getLinkedQuestions = tool({
  description: 'Get questions linked from the given question(s) (outbound links).',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    questionIds: z.string().describe('Question IDs (max 100, semicolon-delimited)'),
    sort: z
      .enum(['activity', 'votes', 'creation', 'hot', 'week', 'month'])
      .optional()
      .describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    questionIds,
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
        `/questions/${encodeURIComponent(questionIds)}/linked`,
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
      if (!result.ok) return failedResult('Failed to get linked Stack Overflow questions', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting linked Stack Overflow questions');
    }
  },
});

export const getRelatedQuestions = tool({
  description: 'Get questions related to the given question(s) (algorithmic "Related" sidebar).',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    questionIds: z.string().describe('Question IDs (max 100, semicolon-delimited)'),
    sort: z
      .enum(['activity', 'votes', 'creation', 'hot', 'week', 'month'])
      .optional()
      .describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    ...pageFields,
    ...dateFields,
    filter: filterField,
  }),
  execute: async ({
    stackOverflowApiKey,
    site,
    questionIds,
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
        `/questions/${encodeURIComponent(questionIds)}/related`,
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
      if (!result.ok) return failedResult('Failed to get related Stack Overflow questions', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting related Stack Overflow questions');
    }
  },
});

export const getQuestionTimeline = tool({
  description:
    'Get the event timeline of question(s): asked, answered, commented, edited, closed, bounties.',
  inputSchema: z.object({
    stackOverflowApiKey: keyField,
    site: siteField,
    questionIds: z.string().describe('Question IDs (max 100, semicolon-delimited)'),
    ...pageFields,
    ...dateFields,
  }),
  execute: async ({ stackOverflowApiKey, site, questionIds, page, pagesize, fromdate, todate }) => {
    try {
      const result = await stackOverflowRequest(
        stackOverflowApiKey,
        `/questions/${encodeURIComponent(questionIds)}/timeline`,
        {
          query: { site: site ?? 'stackoverflow', page, pagesize, fromdate, todate },
        },
      );
      if (!result.ok) return failedResult('Failed to get Stack Overflow question timeline', result);
      return result.data;
    } catch (error) {
      return toStackOverflowError(error, 'Error getting Stack Overflow question timeline');
    }
  },
});
