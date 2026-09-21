// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { devToRequest, toDevToError, requireApiKey } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');

const paginationFields = {
  page: z.number().int().min(1).optional().describe('Page number for pagination'),
  perPage: z.number().int().min(1).optional().describe('Number of items per page'),
};

export const devToGetComment = tool({
  description: 'Get a single comment and its nested replies by comment ID code (e.g. "32k5a").',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    id: z.string().describe('The comment ID code'),
  }),
  execute: async ({ devToApiKey, id }) => {
    try {
      return await devToRequest(devToApiKey, 'GET', `/comments/${encodeURIComponent(id)}`);
    } catch (error) {
      return toDevToError(error, 'Failed to get comment');
    }
  },
});

export const devToListComments = tool({
  description: 'List threaded comments for an article or a podcast episode. Provide articleId or podcastEpisodeId, not both.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    articleId: z.number().int().optional().describe('Article ID to get comments for'),
    podcastEpisodeId: z.number().int().optional().describe('Podcast episode ID to get comments for'),
  }),
  execute: async ({ devToApiKey, articleId, podcastEpisodeId }) => {
    try {
      const query: Record<string, unknown> = {};
      if (articleId !== undefined) query.a_id = articleId;
      if (podcastEpisodeId !== undefined) query.p_id = podcastEpisodeId;
      return await devToRequest(devToApiKey, 'GET', '/comments', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list comments');
    }
  },
});

export const devToGetCurrentUser = tool({
  description: "Get the authenticated user's profile information.",
  inputSchema: z.object({
    devToApiKey: apiKeyField,
  }),
  execute: async ({ devToApiKey }) => {
    const missing = requireApiKey(devToApiKey);
    if (missing) return missing;
    try {
      return await devToRequest(devToApiKey, 'GET', '/users/me');
    } catch (error) {
      return toDevToError(error, 'Failed to get current user');
    }
  },
});

export const devToGetUser = tool({
  description: 'Get a single user by numeric ID or username.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    id: z.string().describe("Numeric user ID (e.g. '1') or username (e.g. 'ben')"),
  }),
  execute: async ({ devToApiKey, id }) => {
    try {
      return await devToRequest(devToApiKey, 'GET', `/users/${encodeURIComponent(id)}`);
    } catch (error) {
      return toDevToError(error, 'Failed to get user');
    }
  },
});

export const devToGetOrganization = tool({
  description: 'Get a single organization by username, including summary, links, and profile image.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    username: z.string().describe("The organization's username (e.g. 'devteam')"),
  }),
  execute: async ({ devToApiKey, username }) => {
    try {
      return await devToRequest(devToApiKey, 'GET', `/organizations/${encodeURIComponent(username)}`);
    } catch (error) {
      return toDevToError(error, 'Failed to get organization');
    }
  },
});

export const devToListOrganizationUsers = tool({
  description: 'List member users of a specific organization.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    username: z.string().describe("The organization's username"),
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, username, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', `/organizations/${encodeURIComponent(username)}/users`, {
        query,
      });
    } catch (error) {
      return toDevToError(error, 'Failed to list organization users');
    }
  },
});

export const devToGetProfileImage = tool({
  description: 'Get the full-size and 90px profile image URLs for a user or organization by username.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    username: z.string().describe('The username of the user or organization'),
  }),
  execute: async ({ devToApiKey, username }) => {
    try {
      return await devToRequest(devToApiKey, 'GET', `/profile_images/${encodeURIComponent(username)}`);
    } catch (error) {
      return toDevToError(error, 'Failed to get profile image');
    }
  },
});

export const devToListTags = tool({
  description: 'List tags used on DEV Community ordered by popularity. Useful for discovery and autocomplete.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/tags', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list tags');
    }
  },
});

export const devToListFollowedTags = tool({
  description: 'List tags followed by the authenticated user, with IDs and points.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
  }),
  execute: async ({ devToApiKey }) => {
    const missing = requireApiKey(devToApiKey);
    if (missing) return missing;
    try {
      return await devToRequest(devToApiKey, 'GET', '/follows/tags');
    } catch (error) {
      return toDevToError(error, 'Failed to list followed tags');
    }
  },
});

export const devToListFollowers = tool({
  description: 'List users who follow the authenticated user. 80 followers per page by default.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    sort: z.string().optional().describe("Sort order, e.g. 'created_at' for newest first"),
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, perPage, ...rest }) => {
    const missing = requireApiKey(devToApiKey);
    if (missing) return missing;
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/followers/users', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list followers');
    }
  },
});

export const devToListPodcastEpisodes = tool({
  description: 'List podcast episodes, optionally filtered by podcast username.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    username: z.string().optional().describe('Filter by podcast username/slug (e.g. codenewbie)'),
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/podcast_episodes', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list podcast episodes');
    }
  },
});

export const devToListReadingList = tool({
  description: "List articles saved to the authenticated user's reading list.",
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, perPage, ...rest }) => {
    const missing = requireApiKey(devToApiKey);
    if (missing) return missing;
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/readinglist', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list reading list');
    }
  },
});

export const devToListVideos = tool({
  description: 'List articles on DEV Community that contain videos.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/videos', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list videos');
    }
  },
});
