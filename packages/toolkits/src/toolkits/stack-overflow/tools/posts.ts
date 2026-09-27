// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    BODY_FILTER,
    failedResult,
    stackOverflowRequest,
    toStackOverflowError,
} from './client.js';

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

export const getAnswers = tool({
    description: 'Get answer(s) by ID, optionally with bodies. Accepts up to 100 semicolon-delimited IDs.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        answerIds: z.string().describe('Answer IDs, e.g. "67890" or "67890;67891"'),
        sort: z.enum(['activity', 'votes', 'creation']).optional().describe('Sort field'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        ...pageFields,
        ...dateFields,
        filter: z.string().optional().describe(`Result filter (pass "${BODY_FILTER}" for answer bodies)`),
    }),
    execute: async ({ stackOverflowApiKey, site, answerIds, sort, order, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/answers/${encodeURIComponent(answerIds)}`, {
                query: { site: site ?? 'stackoverflow', sort, order, page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get Stack Overflow answers', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting Stack Overflow answers');
        }
    },
});

export const getAnswerComments = tool({
    description: 'Get comments on answer(s).',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        answerIds: z.string().describe('Answer IDs (max 100, semicolon-delimited)'),
        sort: z.enum(['creation', 'votes']).optional().describe('Sort field'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        ...pageFields,
        ...dateFields,
        filter: z.string().optional().describe('Result filter'),
    }),
    execute: async ({ stackOverflowApiKey, site, answerIds, sort, order, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/answers/${encodeURIComponent(answerIds)}/comments`, {
                query: { site: site ?? 'stackoverflow', sort, order, page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get comments for Stack Overflow answers', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting comments for Stack Overflow answers');
        }
    },
});

export const getPost = tool({
    description: 'Get any post (question or answer) by ID. Useful when only a post ID is known.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        postIds: z.string().describe('Post IDs (max 100, semicolon-delimited)'),
        ...pageFields,
        ...dateFields,
        filter: z.string().optional().describe(`Result filter (pass "${BODY_FILTER}" for bodies)`),
    }),
    execute: async ({ stackOverflowApiKey, site, postIds, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/posts/${encodeURIComponent(postIds)}`, {
                query: { site: site ?? 'stackoverflow', page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get Stack Overflow posts', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting Stack Overflow posts');
        }
    },
});

export const getPostComments = tool({
    description: 'Get comments on any post(s) by ID.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        postIds: z.string().describe('Post IDs (max 100, semicolon-delimited)'),
        sort: z.enum(['creation', 'votes']).optional().describe('Sort field'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        ...pageFields,
        ...dateFields,
        filter: z.string().optional().describe('Result filter'),
    }),
    execute: async ({ stackOverflowApiKey, site, postIds, sort, order, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/posts/${encodeURIComponent(postIds)}/comments`, {
                query: { site: site ?? 'stackoverflow', sort, order, page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get comments for Stack Overflow posts', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting comments for Stack Overflow posts');
        }
    },
});

export const getPostRevisions = tool({
    description: 'Get edit/revision history of post(s): what changed and when.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        postIds: z.string().describe('Post IDs (max 100, semicolon-delimited)'),
        ...pageFields,
        ...dateFields,
        filter: z.string().optional().describe('Result filter'),
    }),
    execute: async ({ stackOverflowApiKey, site, postIds, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/posts/${encodeURIComponent(postIds)}/revisions`, {
                query: { site: site ?? 'stackoverflow', page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get Stack Overflow post revisions', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting Stack Overflow post revisions');
        }
    },
});

export const getComments = tool({
    description: 'Get comment(s) by ID.',
    inputSchema: z.object({
        stackOverflowApiKey: keyField,
        site: siteField,
        commentIds: z.string().describe('Comment IDs (max 100, semicolon-delimited)'),
        sort: z.enum(['creation', 'votes']).optional().describe('Sort field'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        ...pageFields,
        ...dateFields,
        filter: z.string().optional().describe('Result filter'),
    }),
    execute: async ({ stackOverflowApiKey, site, commentIds, sort, order, page, pagesize, fromdate, todate, filter }) => {
        try {
            const result = await stackOverflowRequest(stackOverflowApiKey, `/comments/${encodeURIComponent(commentIds)}`, {
                query: { site: site ?? 'stackoverflow', sort, order, page, pagesize, fromdate, todate, filter },
            });
            if (!result.ok) return failedResult('Failed to get Stack Overflow comments', result);
            return result.data;
        } catch (error) {
            return toStackOverflowError(error, 'Error getting Stack Overflow comments');
        }
    },
});
