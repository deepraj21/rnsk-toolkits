// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError } from './client.js';

export const intercomCreateCollection = tool({
  description: 'Create a help center collection, optionally nested or translated.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    name: z.string(),
    description: z.string().optional(),
    parentId: z.string().optional().describe('parent collection ID, null for top level'),
    helpCenterId: z.number().int().optional().describe('null for default help center'),
    translatedContent: z.record(z.any()).optional().describe('locale-keyed group content'),
  }),
  execute: async ({
    intercomCredentials,
    name,
    description,
    parentId,
    helpCenterId,
    translatedContent,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/collections`, {
        method: 'POST',
        body: { name, description, parentId, helpCenterId, translatedContent },
      });
      if (!result.ok) return failedResult('Failed to create collection', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating collection');
    }
  },
});

export const intercomRetrieveCollection = tool({
  description: 'Fetch a single help center collection by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/collections/${id}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve collection', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving collection');
    }
  },
});

export const intercomListCollections = tool({
  description: 'List help center collections, most recently updated first.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional(),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/collections`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to list collections', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing collections');
    }
  },
});

export const intercomUpdateCollection = tool({
  description: 'Update a help center collection name, description, or parent.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
    name: z.string().optional(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    translatedContent: z.record(z.any()).optional(),
  }),
  execute: async ({ intercomCredentials, id, name, description, parentId, translatedContent }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/collections/${id}`, {
        method: 'PUT',
        body: { name, description, parentId, translatedContent },
      });
      if (!result.ok) return failedResult('Failed to update collection', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating collection');
    }
  },
});

export const intercomDeleteCollection = tool({
  description: 'Delete a help center collection.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/collections/${id}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete collection', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting collection');
    }
  },
});

export const intercomCreateHelpCenterSection = tool({
  description: 'Create a help center section inside a collection for organizing articles.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    name: z.string(),
    parentId: z.string().describe('parent collection ID'),
    translatedContent: z.record(z.any()).optional().describe('locale-keyed group content'),
  }),
  execute: async ({ intercomCredentials, name, parentId, translatedContent }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/sections`, {
        method: 'POST',
        body: { name, parentId, translatedContent },
      });
      if (!result.ok) return failedResult('Failed to create help center section', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating help center section');
    }
  },
});

export const intercomListHelpCenterSections = tool({
  description: 'List help center sections, most recently updated first.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional().describe('max 150'),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/sections`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to list help center sections', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing help center sections');
    }
  },
});

export const intercomListHelpCenters = tool({
  description: 'List all help centers in the workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/help_centers`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list help centers', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing help centers');
    }
  },
});

export const intercomRetrieveHelpCenter = tool({
  description: 'Fetch a single help center by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/help_center/help_centers/${id}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve help center', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving help center');
    }
  },
});

export const intercomCreateArticle = tool({
  description: 'Create a help center article as draft or published.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    title: z.string(),
    authorId: z.number().int().describe('teammate ID'),
    body: z.string().optional().describe('HTML content'),
    description: z.string().optional(),
    state: z.string().optional().describe('published or draft'),
    parentId: z.string().optional().describe('parent collection/section ID'),
    parentType: z.string().optional().describe('collection or section'),
    translatedContent: z.record(z.any()).optional(),
  }),
  execute: async ({
    intercomCredentials,
    title,
    authorId,
    body,
    description,
    state,
    parentId,
    parentType,
    translatedContent,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/articles`, {
        method: 'POST',
        body: {
          title,
          authorId,
          body,
          description,
          state,
          parentId,
          parentType,
          translatedContent,
        },
      });
      if (!result.ok) return failedResult('Failed to create article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating article');
    }
  },
});

export const intercomRetrieveArticle = tool({
  description: 'Fetch a single article with statistics.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/articles/${id}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving article');
    }
  },
});

export const intercomListArticles = tool({
  description: 'List articles, most recently updated first.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional(),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/articles`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to list articles', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing articles');
    }
  },
});

export const intercomUpdateArticle = tool({
  description: 'Update an article title, body, state, author, or parent.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
    title: z.string().optional(),
    body: z.string().optional().describe('HTML content'),
    authorId: z.number().int().optional(),
    state: z.string().optional().describe('published or draft'),
    parentId: z.string().optional(),
    parentType: z.string().optional(),
    description: z.string().optional(),
    translatedContent: z.record(z.any()).optional(),
  }),
  execute: async ({
    intercomCredentials,
    id,
    title,
    body,
    authorId,
    state,
    parentId,
    parentType,
    description,
    translatedContent,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/articles/${id}`, {
        method: 'PUT',
        body: {
          title,
          body,
          authorId,
          state,
          parentId,
          parentType,
          description,
          translatedContent,
        },
      });
      if (!result.ok) return failedResult('Failed to update article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating article');
    }
  },
});

export const intercomDeleteArticle = tool({
  description: 'Delete a single article.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/articles/${id}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting article');
    }
  },
});

export const intercomSearchArticles = tool({
  description: 'Search articles by phrase, state, and help center.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    phrase: z.string().optional(),
    state: z.string().optional().describe('published, draft, or all'),
    helpCenterId: z.number().int().optional(),
    highlight: z.boolean().optional().describe('highlight matches'),
  }),
  execute: async ({ intercomCredentials, phrase, state, helpCenterId, highlight }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/articles/search`, {
        method: 'GET',
        query: { phrase: phrase, state: state, helpCenterId: helpCenterId, highlight: highlight },
      });
      if (!result.ok) return failedResult('Failed to search articles', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error searching articles');
    }
  },
});

export const intercomCreateInternalArticle = tool({
  description: 'Create an internal team knowledge article.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    title: z.string(),
    body: z.string().optional().describe('HTML content'),
    authorId: z.number().int(),
    ownerId: z.number().int(),
    locale: z.string().optional().describe('e.g. en'),
  }),
  execute: async ({ intercomCredentials, title, body, authorId, ownerId, locale }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/internal_articles`, {
        method: 'POST',
        body: { title, body, authorId, ownerId, locale },
      });
      if (!result.ok) return failedResult('Failed to create internal article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating internal article');
    }
  },
});

export const intercomRetrieveInternalArticle = tool({
  description: 'Fetch a single internal article by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/internal_articles/${id}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve internal article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving internal article');
    }
  },
});

export const intercomListInternalArticles = tool({
  description: 'List internal articles with cursor pagination.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional().describe('1-200'),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/internal_articles`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to list internal articles', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing internal articles');
    }
  },
});

export const intercomUpdateInternalArticle = tool({
  description: 'Update an internal article title, body, author, or owner.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
    title: z.string(),
    body: z.string().describe('HTML content'),
    authorId: z.number().int(),
    ownerId: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id, title, body, authorId, ownerId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/internal_articles/${id}`, {
        method: 'PUT',
        body: { title, body, authorId, ownerId },
      });
      if (!result.ok) return failedResult('Failed to update internal article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating internal article');
    }
  },
});

export const intercomDeleteInternalArticle = tool({
  description: 'Permanently delete an internal article.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.number().int(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/internal_articles/${id}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete internal article', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting internal article');
    }
  },
});

export const intercomSearchInternalArticles = tool({
  description: 'Search internal articles, optionally within a folder.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    folderId: z.string().optional(),
    perPage: z.number().int().optional().describe('1-200'),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, folderId, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/internal_articles/search`, {
        method: 'GET',
        query: { folderId: folderId, perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to search internal articles', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error searching internal articles');
    }
  },
});

export const intercomCreateExternalPage = tool({
  description:
    'Ingest an external page into the Fin content library (upserts on source plus external ID).',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    title: z.string(),
    html: z.string().describe('page body HTML'),
    url: z.string(),
    locale: z.string().describe('must be en'),
    sourceId: z.number().int().describe('content import source ID'),
    externalId: z.string().describe('source-side unique ID'),
    aiAgentAvailability: z.boolean().optional(),
    aiCopilotAvailability: z.boolean().optional(),
  }),
  execute: async ({
    intercomCredentials,
    title,
    html,
    url,
    locale,
    sourceId,
    externalId,
    aiAgentAvailability,
    aiCopilotAvailability,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ai/external_pages`, {
        method: 'POST',
        body: {
          title,
          html,
          url,
          locale,
          sourceId,
          externalId,
          aiAgentAvailability,
          aiCopilotAvailability,
        },
      });
      if (!result.ok) return failedResult('Failed to create external page', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating external page');
    }
  },
});

export const intercomGetExternalPage = tool({
  description: 'Fetch an external page with content and AI availability.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    pageId: z.string(),
  }),
  execute: async ({ intercomCredentials, pageId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ai/external_pages/${pageId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to get external page', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting external page');
    }
  },
});

export const intercomListExternalPages = tool({
  description: 'List external pages in the Fin content library.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional(),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ai/external_pages`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to list external pages', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing external pages');
    }
  },
});

export const intercomUpdateExternalPage = tool({
  description: 'Update an API-created external page content, metadata, or availability.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    pageId: z.string(),
    title: z.string(),
    html: z.string(),
    url: z.string(),
    sourceId: z.number().int(),
    externalId: z.string(),
    locale: z.string().describe('must be en'),
    finAvailability: z.boolean().optional(),
  }),
  execute: async ({
    intercomCredentials,
    pageId,
    title,
    html,
    url,
    sourceId,
    externalId,
    locale,
    finAvailability,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ai/external_pages/${pageId}`, {
        method: 'PUT',
        body: { title, html, url, sourceId, externalId, locale, finAvailability },
      });
      if (!result.ok) return failedResult('Failed to update external page', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating external page');
    }
  },
});

export const intercomDeleteExternalPage = tool({
  description: 'Delete an external page from the content library and AI answers.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    pageId: z.string(),
  }),
  execute: async ({ intercomCredentials, pageId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ai/external_pages/${pageId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete external page', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting external page');
    }
  },
});

export const intercomCreateContentImportSource = tool({
  description: 'Create a container for external pages ingested into Fin.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    url: z.string(),
    syncBehavior: z.string().describe('api, automatic, or manual'),
    status: z.string().optional().describe('active or deactivated'),
  }),
  execute: async ({ intercomCredentials, url, syncBehavior, status }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ai/content_import_sources`, {
        method: 'POST',
        body: { url, syncBehavior, status },
      });
      if (!result.ok) return failedResult('Failed to create content import source', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating content import source');
    }
  },
});

export const intercomGetContentImportSource = tool({
  description: 'Fetch a content import source by ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    sourceId: z.string(),
  }),
  execute: async ({ intercomCredentials, sourceId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/ai/content_import_sources/${sourceId}`,
        { method: 'GET' },
      );
      if (!result.ok) return failedResult('Failed to get content import source', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting content import source');
    }
  },
});

export const intercomListContentImportSources = tool({
  description: 'List content import sources for the workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional().describe('max 150'),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ai/content_import_sources`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to list content import sources', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing content import sources');
    }
  },
});

export const intercomUpdateContentImportSource = tool({
  description: 'Update a content import source URL, sync behavior, or status.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    sourceId: z.string(),
    url: z.string(),
    syncBehavior: z.string().describe('api only via API'),
    status: z.string().optional().describe('active or deactivated'),
  }),
  execute: async ({ intercomCredentials, sourceId, url, syncBehavior, status }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/ai/content_import_sources/${sourceId}`,
        { method: 'PUT', body: { url, syncBehavior, status } },
      );
      if (!result.ok) return failedResult('Failed to update content import source', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating content import source');
    }
  },
});

export const intercomDeleteContentImportSource = tool({
  description: 'Delete a content import source and all its external pages. Permanent.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    sourceId: z.string(),
  }),
  execute: async ({ intercomCredentials, sourceId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/ai/content_import_sources/${sourceId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete content import source', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting content import source');
    }
  },
});

export const intercomListNewsItems = tool({
  description: 'Fetch news items posted in the workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/news/news_items`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list news items', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing news items');
    }
  },
});
