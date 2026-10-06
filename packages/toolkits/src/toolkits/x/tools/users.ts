// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError, fieldQuery, resolveUserId } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');
const expansionsField = z
  .array(z.string())
  .optional()
  .describe('Expansions to include, e.g. pinned_tweet_id, affiliated_organization');
const tweetFieldsField = z
  .array(z.string())
  .optional()
  .describe('Tweet fields for pinned tweets, e.g. created_at, public_metrics');
const userFieldsField = z
  .array(z.string())
  .optional()
  .describe(
    'User fields, e.g. created_at, description, location, public_metrics, verified, profile_image_url, url',
  );

export const xGetUserById = tool({
  description: 'Get a user profile by user ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('User ID'),
    expansions: expansionsField,
    userFields: userFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({ xToken, id, expansions, userFields, tweetFields }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}`, {
        query: { expansions, 'user.fields': userFields, 'tweet.fields': tweetFields },
      });
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting user');
    }
  },
});

export const xGetUsersByIds = tool({
  description: 'Get up to 100 user profiles by their IDs in a single request.',
  inputSchema: z.object({
    xToken: tokenField,
    ids: z.array(z.string()).min(1).max(100).describe('User IDs (max 100)'),
    expansions: expansionsField,
    userFields: userFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({ xToken, ids, expansions, userFields, tweetFields }) => {
    try {
      const result = await xRequest(xToken, '/users', {
        query: { ids, expansions, 'user.fields': userFields, 'tweet.fields': tweetFields },
      });
      if (!result.ok) return failedResult('Failed to get users', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting users');
    }
  },
});

export const xLookupUserByUsername = tool({
  description: 'Get a user profile by username (without the @).',
  inputSchema: z.object({
    xToken: tokenField,
    username: z.string().describe('Username, e.g. xdevelopers'),
    expansions: expansionsField,
    userFields: userFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({ xToken, username, expansions, userFields, tweetFields }) => {
    try {
      const result = await xRequest(xToken, `/users/by/username/${username}`, {
        query: { expansions, 'user.fields': userFields, 'tweet.fields': tweetFields },
      });
      if (!result.ok) return failedResult('Failed to look up user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error looking up user');
    }
  },
});

export const xLookupUsersByUsernames = tool({
  description: 'Get up to 100 user profiles by usernames in a single request.',
  inputSchema: z.object({
    xToken: tokenField,
    usernames: z.array(z.string()).min(1).max(100).describe('Usernames without @ (max 100)'),
    expansions: expansionsField,
    userFields: userFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({ xToken, usernames, expansions, userFields, tweetFields }) => {
    try {
      const result = await xRequest(xToken, '/users/by', {
        query: { usernames, expansions, 'user.fields': userFields, 'tweet.fields': tweetFields },
      });
      if (!result.ok) return failedResult('Failed to look up users', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error looking up users');
    }
  },
});

export const xLookupMe = tool({
  description:
    'Get the profile of the authenticated user. Use first to resolve your own user ID for other tools.',
  inputSchema: z.object({
    xToken: tokenField,
    expansions: expansionsField,
    userFields: userFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({ xToken, expansions, userFields, tweetFields }) => {
    try {
      const result = await xRequest(xToken, '/users/me', {
        query: { expansions, 'user.fields': userFields, 'tweet.fields': tweetFields },
      });
      if (!result.ok) return failedResult('Failed to look up authenticated user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error looking up authenticated user');
    }
  },
});

export const xHomeTimeline = tool({
  description:
    'Get the reverse-chronological home timeline of the authenticated user (posts from followed accounts). Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z
      .string()
      .optional()
      .describe('Authenticated user ID (defaults to me); only your own timeline can be fetched'),
    exclude: z.array(z.string()).optional().describe('Exclude replies and/or retweets'),
    startTime: z.string().optional().describe('Oldest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
    endTime: z.string().optional().describe('Newest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
    sinceId: z.string().optional().describe('Return posts after this post ID'),
    untilId: z.string().optional().describe('Return posts before this post ID'),
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
  execute: async ({
    xToken,
    id,
    exclude,
    startTime,
    endTime,
    sinceId,
    untilId,
    maxResults,
    paginationToken,
    ...fields
  }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(
        xToken,
        `/users/${resolved.id}/timelines/reverse_chronological`,
        {
          query: {
            exclude,
            start_time: startTime,
            end_time: endTime,
            since_id: sinceId,
            until_id: untilId,
            max_results: maxResults,
            pagination_token: paginationToken,
            ...fieldQuery(fields),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to get home timeline', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting home timeline');
    }
  },
});
