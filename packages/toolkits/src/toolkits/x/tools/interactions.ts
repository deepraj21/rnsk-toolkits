// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError, fieldQuery, resolveUserId } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');
const expansionsField = z
  .array(z.string())
  .optional()
  .describe('Expansions to include, e.g. author_id, pinned_tweet_id');
const tweetFieldsField = z
  .array(z.string())
  .optional()
  .describe('Tweet fields, e.g. created_at, public_metrics, text');
const userFieldsField = z
  .array(z.string())
  .optional()
  .describe('User fields, e.g. created_at, description, public_metrics, verified');
const paginationField = z
  .string()
  .optional()
  .describe('Pagination token from a previous response meta.next_token; omit for the first page');
const userListQuery = (fields: Record<string, any>) =>
  fieldQuery({
    expansions: fields.expansions,
    tweetFields: fields.tweetFields,
    userFields: fields.userFields,
  });

export const xLikePost = tool({
  description:
    'Like a post on behalf of the authenticated user. Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    tweetId: z.string().describe('Post ID to like'),
  }),
  execute: async ({ xToken, id, tweetId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/likes`, {
        method: 'POST',
        body: { tweet_id: tweetId },
      });
      if (!result.ok) return failedResult('Failed to like post', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error liking post');
    }
  },
});

export const xUnlikePost = tool({
  description: 'Unlike a post on behalf of the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Authenticated user ID'),
    tweetId: z.string().describe('Post ID to unlike'),
  }),
  execute: async ({ xToken, id, tweetId }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/likes/${tweetId}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to unlike post', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error unliking post');
    }
  },
});

export const xListLikers = tool({
  description: 'Get users who liked a specific post.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Post ID'),
    maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
    paginationToken: paginationField,
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
  }),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/tweets/${id}/liking_users`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...userListQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to list post likers', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error listing post likers');
    }
  },
});

export const xLikedPosts = tool({
  description: 'Get posts liked by a user ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('User ID'),
    maxResults: z.number().int().min(5).max(100).optional().describe('Results per page (5-100)'),
    paginationToken: paginationField,
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
    mediaFields: z.array(z.string()).optional(),
    pollFields: z.array(z.string()).optional(),
    placeFields: z.array(z.string()).optional(),
  }),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/liked_tweets`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...fieldQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get liked posts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting liked posts');
    }
  },
});

export const xRetweetPost = tool({
  description:
    'Repost (retweet) a post on behalf of the authenticated user. Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    tweetId: z.string().describe('Post ID to repost'),
  }),
  execute: async ({ xToken, id, tweetId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/retweets`, {
        method: 'POST',
        body: { tweet_id: tweetId },
      });
      if (!result.ok) return failedResult('Failed to repost', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error reposting');
    }
  },
});

export const xUnretweetPost = tool({
  description:
    'Undo a repost. Requires the original post ID and resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    sourceTweetId: z.string().describe('ID of the reposted (source) post'),
  }),
  execute: async ({ xToken, id, sourceTweetId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/retweets/${sourceTweetId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to undo repost', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error undoing repost');
    }
  },
});

const repostUsersSchema = {
  xToken: tokenField,
  id: z.string().describe('Post ID'),
  maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
  paginationToken: paginationField,
  expansions: expansionsField,
  tweetFields: tweetFieldsField,
  userFields: userFieldsField,
};

export const xReposters = tool({
  description: 'Get users who reposted a specific post.',
  inputSchema: z.object(repostUsersSchema),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/tweets/${id}/retweeted_by`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...userListQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get reposting users', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting reposting users');
    }
  },
});

export const xReposts = tool({
  description: 'Get reposts of a specific post with full post objects and expansions.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Post ID'),
    maxResults: z.number().int().min(10).max(100).optional().describe('Results per page (10-100)'),
    paginationToken: paginationField,
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
    mediaFields: z.array(z.string()).optional(),
    pollFields: z.array(z.string()).optional(),
    placeFields: z.array(z.string()).optional(),
  }),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/tweets/${id}/retweeted_by`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...fieldQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get reposts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting reposts');
    }
  },
});

export const xFollowUser = tool({
  description:
    'Follow a user on behalf of the authenticated user. Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    targetUserId: z.string().describe('User ID to follow'),
  }),
  execute: async ({ xToken, id, targetUserId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/following`, {
        method: 'POST',
        body: { target_user_id: targetUserId },
      });
      if (!result.ok) return failedResult('Failed to follow user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error following user');
    }
  },
});

export const xUnfollowUser = tool({
  description: 'Unfollow a user on behalf of the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    sourceUserId: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    targetUserId: z.string().describe('User ID to unfollow'),
  }),
  execute: async ({ xToken, sourceUserId, targetUserId }) => {
    try {
      const resolved = await resolveUserId(xToken, sourceUserId);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/following/${targetUserId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to unfollow user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error unfollowing user');
    }
  },
});

const followersSchema = {
  xToken: tokenField,
  id: z.string().describe('User ID'),
  maxResults: z.number().int().min(1).max(1000).optional().describe('Results per page (1-1000)'),
  paginationToken: paginationField,
  expansions: expansionsField,
  tweetFields: tweetFieldsField,
  userFields: userFieldsField,
};

export const xFollowers = tool({
  description: 'Get followers of a user by user ID.',
  inputSchema: z.object(followersSchema),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/followers`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...userListQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get followers', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting followers');
    }
  },
});

export const xFollowing = tool({
  description: 'Get accounts a user is following by user ID.',
  inputSchema: z.object(followersSchema),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/following`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...userListQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get following', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting following');
    }
  },
});

export const xBlockedUsers = tool({
  description: 'Get accounts blocked by the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Authenticated user ID'),
    maxResults: z.number().int().min(1).max(1000).optional().describe('Results per page (1-1000)'),
    paginationToken: paginationField,
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
  }),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/blocking`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...userListQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get blocked users', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting blocked users');
    }
  },
});

export const xMutedUsers = tool({
  description: 'Get accounts muted by the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Authenticated user ID'),
    maxResults: z.number().int().min(1).max(1000).optional().describe('Results per page (1-1000)'),
    paginationToken: paginationField,
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
  }),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/muting`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...userListQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get muted users', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting muted users');
    }
  },
});

export const xMuteUser = tool({
  description:
    'Mute a user on behalf of the authenticated user. Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    targetUserId: z.string().describe('User ID to mute'),
  }),
  execute: async ({ xToken, id, targetUserId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/muting`, {
        method: 'POST',
        body: { target_user_id: targetUserId },
      });
      if (!result.ok) return failedResult('Failed to mute user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error muting user');
    }
  },
});

export const xUnmuteUser = tool({
  description:
    'Unmute a user on behalf of the authenticated user. Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    targetUserId: z.string().describe('User ID to unmute'),
  }),
  execute: async ({ xToken, id, targetUserId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/muting/${targetUserId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to unmute user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error unmuting user');
    }
  },
});
