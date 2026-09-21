// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { devToRequest, toDevToError, requireApiKey } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');

const paginationFields = {
  page: z.number().int().min(1).optional().describe('Page number for pagination'),
  perPage: z.number().int().min(1).optional().describe('Number of items per page'),
};

export const devToCreateArticle = tool({
  description:
    'Create a new article on DEV Community. Set published=true to publish immediately, or omit/false to save as a draft.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    title: z.string().describe('The title of the article'),
    bodyMarkdown: z.string().describe('The body content of the article in Markdown format'),
    published: z.boolean().optional().describe('Publish immediately (true) or save as draft (false, default)'),
    description: z.string().optional().describe('Short description used for preview text and SEO'),
    mainImage: z.string().optional().describe('URL of the main cover image'),
    tags: z.array(z.string()).max(4).optional().describe('Array of tag names, maximum 4'),
    series: z.string().optional().describe('Name of the series this article belongs to'),
    canonicalUrl: z.string().optional().describe('Canonical URL if crossposted elsewhere'),
    organizationId: z.number().int().optional().describe('ID of the organization to publish under (must be a member)'),
  }),
  execute: async ({ devToApiKey, bodyMarkdown, mainImage, canonicalUrl, organizationId, ...rest }) => {
    const missing = requireApiKey(devToApiKey);
    if (missing) return missing;
    try {
      const article: Record<string, unknown> = { ...rest, body_markdown: bodyMarkdown };
      if (mainImage !== undefined) article.main_image = mainImage;
      if (canonicalUrl !== undefined) article.canonical_url = canonicalUrl;
      if (organizationId !== undefined) article.organization_id = organizationId;
      return await devToRequest(devToApiKey, 'POST', '/articles', { body: { article } });
    } catch (error) {
      return toDevToError(error, 'Failed to create article');
    }
  },
});

export const devToGetArticle = tool({
  description: 'Get a single published article by its numeric ID, including full body content.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    id: z.number().int().describe('The numeric ID of the article'),
  }),
  execute: async ({ devToApiKey, id }) => {
    try {
      return await devToRequest(devToApiKey, 'GET', `/articles/${id}`);
    } catch (error) {
      return toDevToError(error, 'Failed to get article');
    }
  },
});

export const devToGetArticleByPath = tool({
  description: "Get a single published article by the author's username and the article slug.",
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    username: z.string().describe("The username of the article's author"),
    slug: z.string().describe('The URL-friendly slug of the article'),
  }),
  execute: async ({ devToApiKey, username, slug }) => {
    try {
      return await devToRequest(
        devToApiKey,
        'GET',
        `/articles/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
      );
    } catch (error) {
      return toDevToError(error, 'Failed to get article by path');
    }
  },
});

export const devToListArticles = tool({
  description:
    'List published articles, optionally filtered by tag(s), username, state (fresh/rising/all), top days, or collection. Omit all filters for the latest feed.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    tag: z.string().optional().describe('Filter by a single tag name'),
    tags: z.string().optional().describe('Filter by multiple tag names (comma-separated)'),
    tagsExclude: z.string().optional().describe('Exclude articles with these tags (comma-separated)'),
    username: z.string().optional().describe('Articles from a specific user or organization'),
    state: z.enum(['fresh', 'rising', 'all']).optional().describe('fresh or rising articles; all with username returns up to 1000'),
    top: z.number().int().min(1).optional().describe('Top articles from the last N days (combinable with tag)'),
    collectionId: z.number().int().optional().describe('Articles belonging to a collection/series'),
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, tagsExclude, collectionId, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (tagsExclude !== undefined) query.tags_exclude = tagsExclude;
      if (collectionId !== undefined) query.collection_id = collectionId;
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/articles', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list articles');
    }
  },
});

export const devToListLatestArticles = tool({
  description: 'List published articles sorted strictly by descending publish date (no feed personalization).',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/articles/latest', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list latest articles');
    }
  },
});

export const devToListUserArticles = tool({
  description: "List the authenticated user's published articles in reverse chronological order.",
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
      return await devToRequest(devToApiKey, 'GET', '/articles/me', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list user articles');
    }
  },
});

export const devToListUserPublishedArticles = tool({
  description: "List only the authenticated user's published articles. For drafts, use unpublished/all variants.",
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
      return await devToRequest(devToApiKey, 'GET', '/articles/me/published', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list published articles');
    }
  },
});

export const devToListUserUnpublishedArticles = tool({
  description: "List the authenticated user's unpublished (draft) articles.",
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
      return await devToRequest(devToApiKey, 'GET', '/articles/me/unpublished', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list unpublished articles');
    }
  },
});

export const devToListUserAllArticles = tool({
  description: 'List all of the authenticated user articles, both published and drafts (drafts first).',
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
      return await devToRequest(devToApiKey, 'GET', '/articles/me/all', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list all user articles');
    }
  },
});

export const devToListOrganizationArticles = tool({
  description: 'List articles published by a specific organization.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    username: z.string().describe("The organization's username"),
    ...paginationFields,
  }),
  execute: async ({ devToApiKey, username, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', `/organizations/${encodeURIComponent(username)}/articles`, {
        query,
      });
    } catch (error) {
      return toDevToError(error, 'Failed to list organization articles');
    }
  },
});

export const devToUpdateArticle = tool({
  description: 'Update an existing article owned by the authenticated user. Only provide fields to change.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    id: z.number().int().describe('The ID of the article to update'),
    title: z.string().optional().describe('Updated title'),
    bodyMarkdown: z.string().optional().describe('Updated body in Markdown (include front matter to change tags/series via markdown)'),
    published: z.boolean().optional().describe('Set false to revert a published article to draft'),
    description: z.string().optional().describe('Updated short description'),
    mainImage: z.string().optional().describe('Updated cover image URL'),
    tags: z.array(z.string()).max(4).optional().describe('Updated tag names, maximum 4'),
    series: z.string().optional().describe('Updated series name'),
    canonicalUrl: z.string().optional().describe('Updated canonical URL'),
    organizationId: z.number().int().optional().describe('Organization ID to assign the article to'),
  }),
  execute: async ({ devToApiKey, id, bodyMarkdown, mainImage, canonicalUrl, organizationId, ...rest }) => {
    const missing = requireApiKey(devToApiKey);
    if (missing) return missing;
    try {
      const article: Record<string, unknown> = { ...rest };
      if (bodyMarkdown !== undefined) article.body_markdown = bodyMarkdown;
      if (mainImage !== undefined) article.main_image = mainImage;
      if (canonicalUrl !== undefined) article.canonical_url = canonicalUrl;
      if (organizationId !== undefined) article.organization_id = organizationId;
      return await devToRequest(devToApiKey, 'PUT', `/articles/${id}`, { body: { article } });
    } catch (error) {
      return toDevToError(error, 'Failed to update article');
    }
  },
});
