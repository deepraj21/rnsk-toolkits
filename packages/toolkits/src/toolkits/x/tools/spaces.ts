// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError, fieldQuery } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');
const expansionsField = z
  .array(z.string())
  .optional()
  .describe('Expansions, e.g. host_ids, invited_user_ids, creator_id, speaker_ids');
const userFieldsField = z
  .array(z.string())
  .optional()
  .describe('User fields for expanded hosts/speakers');
const spaceFieldsField = z
  .array(z.string())
  .optional()
  .describe(
    'Space fields, e.g. host_ids, state, title, scheduled_start, created_at, participant_count',
  );
const topicFieldsField = z.array(z.string()).optional().describe('Topic fields');

export const xGetSpace = tool({
  description: 'Get a Space by ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Space ID'),
    expansions: expansionsField,
    userFields: userFieldsField,
    spaceFields: spaceFieldsField,
    topicFields: topicFieldsField,
  }),
  execute: async ({ xToken, id, expansions, userFields, spaceFields, topicFields }) => {
    try {
      const result = await xRequest(xToken, `/spaces/${id}`, {
        query: {
          expansions,
          'user.fields': userFields,
          'space.fields': spaceFields,
          'topic.fields': topicFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get space', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting space');
    }
  },
});

export const xGetSpacesByIds = tool({
  description: 'Get up to 100 Spaces by their IDs in a single request.',
  inputSchema: z.object({
    xToken: tokenField,
    ids: z.array(z.string()).min(1).max(100).describe('Space IDs (max 100)'),
    expansions: expansionsField,
    userFields: userFieldsField,
    spaceFields: spaceFieldsField,
    topicFields: topicFieldsField,
  }),
  execute: async ({ xToken, ids, expansions, userFields, spaceFields, topicFields }) => {
    try {
      const result = await xRequest(xToken, '/spaces', {
        query: {
          ids,
          expansions,
          'user.fields': userFields,
          'space.fields': spaceFields,
          'topic.fields': topicFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get spaces', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting spaces');
    }
  },
});

export const xSpacesByCreators = tool({
  description: 'Get Spaces created by the given user IDs (live or scheduled).',
  inputSchema: z.object({
    xToken: tokenField,
    userIds: z.array(z.string()).min(1).max(100).describe('Creator user IDs (max 100)'),
    expansions: expansionsField,
    userFields: userFieldsField,
    spaceFields: spaceFieldsField,
    topicFields: topicFieldsField,
  }),
  execute: async ({ xToken, userIds, expansions, userFields, spaceFields, topicFields }) => {
    try {
      const result = await xRequest(xToken, '/spaces/by/creator_ids', {
        query: {
          user_ids: userIds,
          expansions,
          'user.fields': userFields,
          'space.fields': spaceFields,
          'topic.fields': topicFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get spaces by creators', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting spaces by creators');
    }
  },
});

export const xSearchSpaces = tool({
  description: 'Search live or scheduled Spaces by keyword query.',
  inputSchema: z.object({
    xToken: tokenField,
    query: z.string().describe('Search keyword, e.g. technology'),
    state: z.string().optional().describe('live, scheduled, or all'),
    maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
    expansions: expansionsField,
    userFields: userFieldsField,
    spaceFields: spaceFieldsField,
    topicFields: topicFieldsField,
  }),
  execute: async ({
    xToken,
    query,
    state,
    maxResults,
    expansions,
    userFields,
    spaceFields,
    topicFields,
  }) => {
    try {
      const result = await xRequest(xToken, '/spaces/search', {
        query: {
          query,
          state,
          max_results: maxResults,
          expansions,
          'user.fields': userFields,
          'space.fields': spaceFields,
          'topic.fields': topicFields,
        },
      });
      if (!result.ok) return failedResult('Failed to search spaces', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error searching spaces');
    }
  },
});

export const xSpaceBuyers = tool({
  description: 'Get users who purchased a ticket for a ticketed Space.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Space ID'),
    maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
    paginationToken: z
      .string()
      .optional()
      .describe('Pagination token from a previous response; omit for the first page'),
    expansions: expansionsField,
    tweetFields: z.array(z.string()).optional(),
    userFields: userFieldsField,
  }),
  execute: async ({
    xToken,
    id,
    maxResults,
    paginationToken,
    expansions,
    tweetFields,
    userFields,
  }) => {
    try {
      const result = await xRequest(xToken, `/spaces/${id}/buyers`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          expansions,
          'tweet.fields': tweetFields,
          'user.fields': userFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get space ticket buyers', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting space ticket buyers');
    }
  },
});

export const xSpacePosts = tool({
  description: 'Get posts shared in a Space by Space ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Space ID'),
    maxResults: z.number().int().min(10).max(100).optional().describe('Results per page (10-100)'),
    expansions: z.array(z.string()).optional(),
    tweetFields: z.array(z.string()).optional(),
    userFields: z.array(z.string()).optional(),
    mediaFields: z.array(z.string()).optional(),
    pollFields: z.array(z.string()).optional(),
    placeFields: z.array(z.string()).optional(),
  }),
  execute: async ({ xToken, id, maxResults, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/spaces/${id}/tweets`, {
        query: { max_results: maxResults, ...fieldQuery(fields) },
      });
      if (!result.ok) return failedResult('Failed to get space posts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting space posts');
    }
  },
});
