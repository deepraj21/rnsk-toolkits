// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError, fieldQuery, resolveUserId } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');

export const xGetBookmarks = tool({
  description:
    'Get posts bookmarked by the authenticated user. Only your own bookmarks can be retrieved; the user ID defaults to you.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
    paginationToken: z
      .string()
      .optional()
      .describe('Pagination token from a previous response; omit for the first page'),
    expansions: z.array(z.string()).optional(),
    tweetFields: z.array(z.string()).optional(),
    userFields: z.array(z.string()).optional(),
    mediaFields: z.array(z.string()).optional(),
    pollFields: z.array(z.string()).optional(),
    placeFields: z.array(z.string()).optional(),
  }),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/bookmarks`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...fieldQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get bookmarks', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting bookmarks');
    }
  },
});

export const xAddBookmark = tool({
  description: 'Add a post to the authenticated user bookmarks.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Authenticated user ID'),
    tweetId: z.string().describe('Post ID to bookmark'),
  }),
  execute: async ({ xToken, id, tweetId }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/bookmarks`, {
        method: 'POST',
        body: { tweet_id: tweetId },
      });
      if (!result.ok) return failedResult('Failed to add bookmark', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error adding bookmark');
    }
  },
});

export const xRemoveBookmark = tool({
  description:
    'Remove a post from the authenticated user bookmarks. Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    tweetId: z.string().describe('Bookmarked post ID to remove'),
  }),
  execute: async ({ xToken, id, tweetId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/bookmarks/${tweetId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to remove bookmark', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error removing bookmark');
    }
  },
});
