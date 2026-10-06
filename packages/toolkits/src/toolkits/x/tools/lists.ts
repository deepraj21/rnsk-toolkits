// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError, fieldQuery, resolveUserId } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');
const expansionsField = z
  .array(z.string())
  .optional()
  .describe('Expansions to include, e.g. owner_id');
const userFieldsField = z
  .array(z.string())
  .optional()
  .describe('User fields for expanded owners/members');
const listFieldsField = z
  .array(z.string())
  .optional()
  .describe(
    'List fields, e.g. created_at, description, follower_count, member_count, private, owner_id',
  );
const paginationField = z
  .string()
  .optional()
  .describe('Pagination token from a previous response; omit for the first page');

export const xCreateList = tool({
  description: 'Create a new List owned by the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    name: z.string().describe('List name'),
    description: z.string().optional().describe('List description'),
    private: z.boolean().optional().describe('True for a private list'),
  }),
  execute: async ({ xToken, ...body }) => {
    try {
      const result = await xRequest(xToken, '/lists', { method: 'POST', body });
      if (!result.ok) return failedResult('Failed to create list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error creating list');
    }
  },
});

export const xGetList = tool({
  description: 'Get a List by ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('List ID'),
    expansions: expansionsField,
    listFields: listFieldsField,
    userFields: userFieldsField,
  }),
  execute: async ({ xToken, id, expansions, listFields, userFields }) => {
    try {
      const result = await xRequest(xToken, `/lists/${id}`, {
        query: { expansions, 'list.fields': listFields, 'user.fields': userFields },
      });
      if (!result.ok) return failedResult('Failed to get list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting list');
    }
  },
});

export const xUpdateList = tool({
  description:
    'Update a List name, description, or privacy. The list must be owned by the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('List ID'),
    name: z.string().optional().describe('New list name'),
    description: z.string().optional().describe('New list description'),
    private: z.boolean().optional().describe('True for a private list'),
  }),
  execute: async ({ xToken, id, ...body }) => {
    try {
      const result = await xRequest(xToken, `/lists/${id}`, { method: 'PUT', body });
      if (!result.ok) return failedResult('Failed to update list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error updating list');
    }
  },
});

export const xDeleteList = tool({
  description: 'Delete a List owned by the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('List ID'),
  }),
  execute: async ({ xToken, id }) => {
    try {
      const result = await xRequest(xToken, `/lists/${id}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error deleting list');
    }
  },
});

export const xAddListMember = tool({
  description: 'Add a user to a List owned by the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('List ID'),
    userId: z.string().describe('User ID to add (convert a username via user lookup first)'),
  }),
  execute: async ({ xToken, id, userId }) => {
    try {
      const result = await xRequest(xToken, `/lists/${id}/members`, {
        method: 'POST',
        body: { user_id: userId },
      });
      if (!result.ok) return failedResult('Failed to add list member', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error adding list member');
    }
  },
});

export const xRemoveListMember = tool({
  description: 'Remove a user from a List owned by the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('List ID'),
    userId: z.string().describe('User ID to remove'),
  }),
  execute: async ({ xToken, id, userId }) => {
    try {
      const result = await xRequest(xToken, `/lists/${id}/members/${userId}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to remove list member', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error removing list member');
    }
  },
});

const listPeopleSchema = {
  xToken: tokenField,
  id: z.string().describe('List ID'),
  maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
  paginationToken: paginationField,
  expansions: expansionsField,
  tweetFields: z.array(z.string()).optional(),
  userFields: userFieldsField,
};

export const xListMembers = tool({
  description: 'Get members of a List.',
  inputSchema: z.object(listPeopleSchema),
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
      const result = await xRequest(xToken, `/lists/${id}/members`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          expansions,
          'tweet.fields': tweetFields,
          'user.fields': userFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get list members', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting list members');
    }
  },
});

export const xListFollowers = tool({
  description: 'Get followers of a List.',
  inputSchema: z.object(listPeopleSchema),
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
      const result = await xRequest(xToken, `/lists/${id}/followers`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          expansions,
          'tweet.fields': tweetFields,
          'user.fields': userFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get list followers', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting list followers');
    }
  },
});

export const xFollowList = tool({
  description: 'Follow a List on behalf of the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Authenticated user ID'),
    listId: z.string().describe('List ID to follow'),
  }),
  execute: async ({ xToken, id, listId }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/followed_lists`, {
        method: 'POST',
        body: { list_id: listId },
      });
      if (!result.ok) return failedResult('Failed to follow list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error following list');
    }
  },
});

export const xUnfollowList = tool({
  description: 'Unfollow a List on behalf of the authenticated user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Authenticated user ID'),
    listId: z.string().describe('List ID to unfollow'),
  }),
  execute: async ({ xToken, id, listId }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/followed_lists/${listId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to unfollow list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error unfollowing list');
    }
  },
});

export const xPinList = tool({
  description: 'Pin a List to the authenticated user profile.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Authenticated user ID'),
    listId: z.string().describe('List ID to pin'),
  }),
  execute: async ({ xToken, id, listId }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/pinned_lists`, {
        method: 'PUT',
        body: { list_id: listId },
      });
      if (!result.ok) return failedResult('Failed to pin list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error pinning list');
    }
  },
});

export const xUnpinList = tool({
  description:
    'Unpin a List from the authenticated user profile. Resolves the user ID automatically when omitted.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().optional().describe('Authenticated user ID (defaults to me)'),
    listId: z.string().describe('List ID to unpin'),
  }),
  execute: async ({ xToken, id, listId }) => {
    try {
      const resolved = await resolveUserId(xToken, id);
      if (!resolved.id) return resolved.error;
      const result = await xRequest(xToken, `/users/${resolved.id}/pinned_lists/${listId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to unpin list', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error unpinning list');
    }
  },
});

const userListsSchema = {
  xToken: tokenField,
  id: z.string().describe('User ID'),
  maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
  paginationToken: paginationField,
  expansions: expansionsField,
  listFields: listFieldsField,
  userFields: userFieldsField,
};

async function getUserLists(
  xToken: string | undefined,
  id: string,
  rel: string,
  params: Record<string, any>,
) {
  const { maxResults, paginationToken, expansions, listFields, userFields } = params;
  return xRequest(xToken, `/users/${id}/${rel}`, {
    query: {
      max_results: maxResults,
      pagination_token: paginationToken,
      expansions,
      'list.fields': listFields,
      'user.fields': userFields,
    },
  });
}

export const xOwnedLists = tool({
  description: 'Get Lists owned by a user.',
  inputSchema: z.object(userListsSchema),
  execute: async ({ xToken, id, ...params }) => {
    try {
      const result = await getUserLists(xToken, id, 'owned_lists', params);
      if (!result.ok) return failedResult('Failed to get owned lists', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting owned lists');
    }
  },
});

export const xFollowedLists = tool({
  description: 'Get Lists followed by a user.',
  inputSchema: z.object(userListsSchema),
  execute: async ({ xToken, id, ...params }) => {
    try {
      const result = await getUserLists(xToken, id, 'followed_lists', params);
      if (!result.ok) return failedResult('Failed to get followed lists', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting followed lists');
    }
  },
});

export const xListMemberships = tool({
  description: 'Get Lists a user is a member of.',
  inputSchema: z.object(userListsSchema),
  execute: async ({ xToken, id, ...params }) => {
    try {
      const result = await getUserLists(xToken, id, 'list_memberships', params);
      if (!result.ok) return failedResult('Failed to get list memberships', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting list memberships');
    }
  },
});

export const xPinnedLists = tool({
  description: 'Get Lists pinned by a user.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('User ID'),
    expansions: expansionsField,
    listFields: listFieldsField,
    userFields: userFieldsField,
  }),
  execute: async ({ xToken, id, expansions, listFields, userFields }) => {
    try {
      const result = await xRequest(xToken, `/users/${id}/pinned_lists`, {
        query: { expansions, 'list.fields': listFields, 'user.fields': userFields },
      });
      if (!result.ok) return failedResult('Failed to get pinned lists', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting pinned lists');
    }
  },
});

export const xListTimeline = tool({
  description: 'Get the timeline of posts from a List by List ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('List ID'),
    maxResults: z.number().int().min(1).max(100).optional().describe('Results per page (1-100)'),
    paginationToken: paginationField,
    expansions: z.array(z.string()).optional(),
    tweetFields: z.array(z.string()).optional(),
    userFields: z.array(z.string()).optional(),
    mediaFields: z.array(z.string()).optional(),
    pollFields: z.array(z.string()).optional(),
    placeFields: z.array(z.string()).optional(),
  }),
  execute: async ({ xToken, id, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/lists/${id}/tweets`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          ...fieldQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get list timeline', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting list timeline');
    }
  },
});
