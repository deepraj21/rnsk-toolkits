// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupClickUpUpdateDocPage = tool({
  description:
    "Tool to update/edit a ClickUp Doc page's title and/or content via the v3 Docs API. Use when you need to modify a Doc page's name or content programmatically.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z
      .string()
      .optional()
      .describe(
        'The new title/name for the page. If not provided, the page name will not be changed.',
      ),
    docId: z.string().describe('The unique identifier for the document containing the page.'),
    content: z
      .string()
      .optional()
      .describe(
        'The new content for the page in markdown format. If not provided, the page content will not be changed. Use this field to update, replace, or append to the page content.',
      ),
    pageId: z.string().describe('The unique identifier for the page to update.'),
    workspaceId: z.string().describe('The workspace ID containing the document.'),
  }),
  execute: async ({ clickupToken, name, docId, content, pageId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V3, `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`, {
      body: nest({ name: name, content: content }),
    });
  },
});

export const clickupCreateDoc = tool({
  description:
    'Tool to create a new ClickUp Doc in a Workspace (v3 Docs API) and return the new doc_id for follow-up page/content operations. Use when you need to create a new document in ClickUp.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('The name/title for the new document.'),
    parentId: z
      .string()
      .optional()
      .describe(
        'Optional parent location ID (space, folder, or list ID) where the doc should be created. If omitted, the doc will be created at the workspace level.',
      ),
    parentType: z
      .enum(['space', 'folder', 'list'])
      .optional()
      .describe(
        "Type of parent location. Required if parent_id is provided. Must be 'space', 'folder', or 'list'.",
      ),
    workspaceId: z.string().describe('The workspace ID where the document will be created.'),
  }),
  execute: async ({ clickupToken, name, parentId, parentType, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V3, `/workspaces/${workspaceId}/docs`, {
      body: nest({ name: name, parent__id: parentId, parent__type: parentType }),
    });
  },
});

export const clickupCreateDocPage = tool({
  description:
    'Tool to create a page in a ClickUp Doc (v3 Docs API). Use when you need to add a new page to an existing document, either as a root page or as a sub-page under a parent page.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z
      .string()
      .optional()
      .describe(
        'The name of the new page. If not provided, page will be created with an empty name.',
      ),
    docId: z
      .string()
      .describe(
        "The ID of the doc in format '{alphanumeric_prefix}-{number}' (e.g., '2kz0k9bp-1096'). To get a valid doc_id, use CLICKUP_CLICK_UP_SEARCH_DOCS or extract from a ClickUp Doc URL.",
      ),
    content: z
      .string()
      .optional()
      .describe(
        'The content of the new page. Supports markdown or plain text based on content_format.',
      ),
    subTitle: z.string().optional().describe('The subtitle of the new page.'),
    workspaceId: z
      .number()
      .int()
      .describe(
        'The ID of the Workspace. Obtain this from the CLICKUP_AUTHORIZATION_GET_WORK_SPACE_LIST or CLICKUP_CLICK_UP_SEARCH_DOCS action.',
      ),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe("The format the page content is in. Defaults to 'text/md' for markdown."),
    parentPageId: z
      .string()
      .optional()
      .describe(
        'The ID of the parent page. If provided, the new page will be created as a sub-page. If omitted, this will be a root page in the Doc.',
      ),
  }),
  execute: async ({
    clickupToken,
    name,
    docId,
    content,
    subTitle,
    workspaceId,
    contentFormat,
    parentPageId,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V3, `/workspaces/${workspaceId}/docs/${docId}/pages`, {
      body: nest({
        name: name,
        content: content,
        sub_title: subTitle,
        parent_page_id: parentPageId,
      }),
      query: { content_format: contentFormat },
    });
  },
});

export const clickupGetDocContent = tool({
  description:
    "Tool to fetch the full content of a ClickUp Doc including metadata and all page contents in markdown format. Use when you need to read or summarize a Doc's content given workspace_id and doc_id.",
  inputSchema: z.object({
    clickupToken: tokenField,
    docId: z
      .string()
      .describe(
        "The unique ClickUp Doc ID in format '{alphanumeric_prefix}-{number}' (e.g., '2kz0k9bp-1376'). IMPORTANT: Numeric-only IDs (e.g., '4017245840171325375') are View IDs, NOT Doc IDs, and will fail. To get a valid doc_id, use CLICKUP_CLICK_UP_SE",
      ),
    pageIds: z
      .array(z.string())
      .optional()
      .describe(
        "Optional list of specific page IDs to fetch. If provided, only these pages will be retrieved. If omitted, all pages in the doc will be fetched. Page IDs follow the same format as doc_id (e.g., '2kz0k9bp-416').",
      ),
    workspaceId: z
      .string()
      .describe(
        'The numeric workspace ID containing the document. Obtain this from the CLICKUP_AUTHORIZATION_GET_WORK_SPACE_LIST or CLICKUP_CLICK_UP_SEARCH_DOCS action.',
      ),
    includePageListingOnly: z
      .boolean()
      .optional()
      .describe(
        'If true, only fetch the list of pages without their content. Useful for discovering page structure without the full content retrieval overhead.',
      ),
  }),
  execute: async ({ clickupToken, docId, pageIds, workspaceId, includePageListingOnly }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/docs/${docId}`, {
      query: { page_ids: pageIds, include_page_listing_only: includePageListingOnly },
    });
  },
});

export const clickupGetDocPageContent = tool({
  description:
    "Tool to fetch a single ClickUp Doc page's content and metadata by workspace_id + doc_id + page_id (v3 Docs API). Use when you need to read the content of a specific page without fetching the entire Doc.",
  inputSchema: z.object({
    clickupToken: tokenField,
    docId: z
      .string()
      .describe(
        "The unique ClickUp Doc ID in format '{alphanumeric_prefix}-{number}' (e.g., '2kz0k9bp-1376'). To get a valid doc_id, use CLICKUP_CLICK_UP_SEARCH_DOCS or extract from a ClickUp Doc URL.",
      ),
    pageId: z
      .string()
      .describe(
        "The unique page ID to retrieve, following the same format as doc_id (e.g., '2kz0k9bp-416'). Obtain from CLICKUP_CLICK_UP_GET_DOC_CONTENT with include_page_listing_only=true or from the Doc's page structure.",
      ),
    workspaceId: z
      .string()
      .describe(
        'The numeric workspace ID containing the document. Obtain this from the CLICKUP_AUTHORIZATION_GET_WORK_SPACE_LIST or CLICKUP_CLICK_UP_SEARCH_DOCS action.',
      ),
  }),
  execute: async ({ clickupToken, docId, pageId, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`);
  },
});

export const clickupGetDocPageListing = tool({
  description:
    'Tool to fetch the page listing structure of a ClickUp Doc by workspace_id and doc_id. Use when you need to discover the hierarchical structure of pages and subpages within a Doc without fetching the actual content.',
  inputSchema: z.object({
    clickupToken: tokenField,
    docId: z
      .string()
      .describe(
        "The unique ClickUp Doc ID in format '{alphanumeric_prefix}-{number}' (e.g., '2kz0k9bp-1096'). To get a valid doc_id, use CLICKUP_CLICK_UP_SEARCH_DOCS or extract from a ClickUp Doc URL.",
      ),
    workspaceId: z
      .string()
      .describe(
        'The numeric workspace ID containing the document. Obtain this from the CLICKUP_AUTHORIZATION_GET_WORK_SPACE_LIST or CLICKUP_CLICK_UP_SEARCH_DOCS action.',
      ),
    maxPageDepth: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum depth to fetch pages/subpages. A value less than 0 does not limit the depth. Defaults to -1 (unlimited depth).',
      ),
  }),
  execute: async ({ clickupToken, docId, workspaceId, maxPageDepth }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/docs/${docId}/pages`, {
      query: { max_page_depth: maxPageDepth },
    });
  },
});

export const clickupGetDocPagesPublic = tool({
  description:
    'Tool to fetch pages belonging to a ClickUp Doc. Use when you need to list all pages in a doc with their content and structure.',
  inputSchema: z.object({
    clickupToken: tokenField,
    docId: z
      .string()
      .describe(
        "The ID of the doc in format '{alphanumeric_prefix}-{number}' (e.g., '2kz0k9bp-1096'). To get a valid doc_id, use CLICKUP_CLICK_UP_SEARCH_DOCS or extract from a ClickUp Doc URL.",
      ),
    workspaceId: z
      .string()
      .describe(
        'The ID of the Workspace. Obtain this from the CLICKUP_AUTHORIZATION_GET_WORK_SPACE_LIST or CLICKUP_CLICK_UP_SEARCH_DOCS action.',
      ),
    contentFormat: z
      .enum(['text/md', 'text/plain'])
      .optional()
      .describe('Content format options for page content.'),
    maxPageDepth: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum depth to fetch pages/subpages. A value less than 0 does not limit the depth.',
      ),
  }),
  execute: async ({ clickupToken, docId, workspaceId, contentFormat, maxPageDepth }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/docs/${docId}/pages/public`, {
      query: { content_format: contentFormat, max_page_depth: maxPageDepth },
    });
  },
});

export const clickupSearchDocs = tool({
  description:
    'Tool to search and list Docs metadata in a ClickUp workspace. Use after confirming the workspace ID to quickly locate relevant meeting notes before fetching pages.',
  inputSchema: z.object({
    clickupToken: tokenField,
    limit: z.number().int().optional().describe('Maximum results per page. Default: 50, max: 100.'),
    cursor: z.string().optional().describe('Cursor from previous response to fetch next page.'),
    workspaceId: z.string().describe('ID of the ClickUp Workspace to list Docs from.'),
  }),
  execute: async ({ clickupToken, limit, cursor, workspaceId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V3, `/workspaces/${workspaceId}/docs`, {
      query: { limit: limit, cursor: cursor },
    });
  },
});
