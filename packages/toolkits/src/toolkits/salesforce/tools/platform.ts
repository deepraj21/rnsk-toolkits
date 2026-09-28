// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceDeleteFile = tool({
  description:
    'Tool to permanently delete a file from Salesforce. Use when you need to remove a file and its content. This operation cannot be undone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fileId: z.string().describe('The unique identifier (ID) of the file to delete in Salesforce.'),
  }),
  execute: async ({ salesforceCredentials, fileId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/ContentDocument/${fileId}`);
  },
});

export const salesforceGetApi = tool({
  description:
    'Tool to discover available REST API resources for a specified Salesforce API version. Use when you need to find available endpoints and their URIs for a specific API version.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    version: z
      .string()
      .optional()
      .describe(
        'The Salesforce API version to query in format vXX.X (e.g., v62.0, v66.0). If not provided, uses the version from the authenticated connection.',
      ),
  }),
  execute: async ({ salesforceCredentials, version }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, version ? `/services/data/${version}/` : '/services/data/');
  },
});

export const salesforceGetChatterResources = tool({
  description:
    'Tool to access Chatter resources directory. Use when you need to discover available Chatter feeds, groups, users, email digest controls, emojis, extensions, or streams.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/chatter`);
  },
});

export const salesforceGetConsentAction = tool({
  description:
    "Tool to check consent preferences for a SINGLE action (e.g. email, track, fax, phone, solicit, shouldForget) across one or more records (Contact, Lead, User, Person Account, or Individual). Returns a result per identifier; the 'proceed' object is keyed by the requested action, not a fixed set of actions. To query multiple actions at once, use the /consent/multiaction endpoint instead.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    ids: z
      .string()
      .describe(
        'A comma-separated list of identifiers (email addresses or record IDs) for which consent data is being requested. These can be IDs of Lead, Contact, User, Person Account, or Individual records.',
      ),
    action: z
      .string()
      .describe(
        "The consent action to check. Common values include 'email', 'track', 'fax', or 'shouldForget'. This determines what type of consent preference is being queried.",
      ),
  }),
  execute: async ({ salesforceCredentials, ids, action }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/consent/action/${action}`, { query: { ids: ids } });
  },
});

export const salesforceGetFileInformation = tool({
  description:
    'Tool to retrieve comprehensive metadata and information about a specified file in Salesforce. Use when you need detailed file information including ownership, sharing settings, download URLs, and rendition status.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fileId: z
      .string()
      .describe(
        'The unique identifier for the file - 18-character Salesforce ID (ContentDocument ID or ContentVersion ID). Example: 069xx000000001AAAQ',
      ),
  }),
  execute: async ({ salesforceCredentials, fileId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/connect/files/${fileId}`);
  },
});

export const salesforceGetFileShares = tool({
  description:
    'Returns information about the objects with which the specified file has been shared. Use when you need to understand who has access to a specific file in Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    page: z
      .number()
      .int()
      .optional()
      .describe(
        'Page number to retrieve (1-based). Use next_page_url from the response to paginate.',
      ),
    fileId: z
      .string()
      .describe(
        'The 18-character Salesforce ID of the ContentDocument (file) for which to retrieve share information.',
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe('Number of file-share records to return per page.'),
  }),
  execute: async ({ salesforceCredentials, page, fileId, pageSize }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/connect/files/${fileId}/file-shares`, {
      query: { page: page, page_size: pageSize },
    });
  },
});

export const salesforceGetOrgLimits = tool({
  description:
    'Tool to retrieve organization limits with max and remaining allocations. Use when you need to check API usage, storage limits, or other resource consumption in Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/limits`);
  },
});

export const salesforceGetRecordCounts = tool({
  description:
    'Tool to retrieve total record counts for specified Salesforce objects. Use when you need to check storage usage or understand data volume for specific sObjects.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobjects: z
      .string()
      .describe(
        "Comma-separated list of Salesforce object API names to retrieve record counts for. Examples: 'Account' for a single object or 'Account,Opportunity,Contact' for multiple objects.",
      ),
  }),
  execute: async ({ salesforceCredentials, sobjects }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const sObjectsArr =
      typeof sObjects === 'string'
        ? sObjects
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : sObjects;
    return sfPost(salesforceCredentials, `/record-counts`, { body: { sObjects: sObjectsArr } });
  },
});

export const salesforceGetSearchLayout = tool({
  description:
    'Retrieves search result layout information for specified sObjects. Use when you need to understand which fields are displayed in search results for objects.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    objectNames: z
      .string()
      .describe(
        "Comma-separated list of sObject API names for which to retrieve search layouts (e.g., 'Account,Contact'). Can include standard objects (Account, Contact, Lead, Opportunity, Case) and custom objects (CustomObject__c).",
      ),
  }),
  execute: async ({ salesforceCredentials, objectNames }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/search/layout`, { query: { q: objectNames } });
  },
});

export const salesforceGetSearchSuggestions = tool({
  description:
    "Returns a list of suggested searches based on the user's query string. Use when you want to help users discover relevant search terms before performing a search.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .describe(
        'The search query string for which to return suggested queries. This is the partial text input from the user.',
      ),
    channel: z
      .enum(['Pkb', 'Csp', 'Prm', 'App'])
      .describe(
        "The channel context for the search suggestions. Valid values: 'Pkb' (Public Knowledge Base), 'Csp' (Customer Service Portal), 'Prm' (Partner Portal), 'App' (Internal Application).",
      ),
    sobject: z
      .string()
      .optional()
      .describe(
        'The Salesforce object type to focus the suggestions on. Limits suggestions to queries relevant to specific object types.',
      ),
    language: z
      .string()
      .describe(
        "The language for the search suggestions. Required parameter. Use standard locale codes (e.g., 'en_US', 'fr_FR').",
      ),
  }),
  execute: async ({ salesforceCredentials, q, channel, sobject, language }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/search/suggestions`, {
      query: { q: q, channel: channel, sobject: sobject, language: language },
    });
  },
});

export const salesforceGetSupport = tool({
  description:
    'Retrieves the root of the Support Knowledge REST API. Use when you need to access knowledge articles and data category information.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/support`);
  },
});

export const salesforceGetSupportKnowledgeArticles = tool({
  description:
    "Retrieves user's visible knowledge articles and data categories from Salesforce Knowledge. Use when you need to access published, draft, or archived articles based on user permissions.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sort: z.string().optional().describe("Sort order for results (e.g., 'mostViewed')."),
    topics: z.string().optional().describe('Filter articles by topics.'),
    channel: z
      .enum(['App', 'Pkb', 'Csp', 'Prm'])
      .optional()
      .describe(
        "Specifies the visibility channel through which articles are accessed. Valid values: 'App' (internal app), 'Pkb' (public knowledge base), 'Csp' (customer portal), 'Prm' (partner portal).",
      ),
    pageSize: z
      .number()
      .int()
      .optional()
      .describe('Number of articles to return per page for pagination.'),
    categories: z
      .string()
      .optional()
      .describe(
        'Filters articles by data category groups and categories. Format varies based on category structure.',
      ),
    pageNumber: z.number().int().optional().describe('Page number for paginated results.'),
    publishStatus: z
      .enum(['Draft', 'Online', 'Archived'])
      .optional()
      .describe(
        "Filter by publication status. Values: 'Draft', 'Online' (published), 'Archived'. Note: Requires 'Manage Articles' permission for 'Online' status. In API version 47.0+ with Lightning Knowledge, all statuses are returned by default.",
      ),
    acceptLanguage: z
      .string()
      .optional()
      .describe(
        "Language for the knowledge articles. Must be specified in HTTP header format (e.g., 'en-US', 'en-US,en;q=0.9'). This field is required by the Salesforce API.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    sort,
    topics,
    channel,
    pageSize,
    categories,
    pageNumber,
    publishStatus,
    acceptLanguage,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const extraHeaders = acceptLanguage ? { 'Accept-Language': acceptLanguage } : {};
    return sfGet(salesforceCredentials, `/support/knowledgeArticles`, {
      query: {
        sort: sort,
        topics: topics,
        channel: channel,
        page_size: pageSize,
        categories: categories,
        page_number: pageNumber,
        publish_status: publishStatus,
      },
      headers: { ...extraHeaders },
    });
  },
});

export const salesforceGetTheme = tool({
  description:
    'Tool to get icons and colors for Salesforce UI themes. Use when you need to retrieve theme information for objects in the organization.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/theme`);
  },
});

export const salesforceHeadSobjectsUserPassword = tool({
  description:
    'Tool to return HTTP headers for User password resource without response body. Use when you need to check user password metadata and expiration status efficiently without retrieving the full response content.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    userId: z.string().describe('The Salesforce User record identifier (18-character User ID).'),
  }),
  execute: async ({ salesforceCredentials, userId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfHead(salesforceCredentials, `/sobjects/User/${userId}/password`);
  },
});

export const salesforceSearchKnowledgeArticles = tool({
  description:
    'Search for Salesforce Knowledge articles with titles matching the search query. Returns auto-suggest results for Knowledge articles based on title matches.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z
      .string()
      .describe(
        "The user's search query string to match against article titles. This is the text that will be matched against Knowledge article titles.",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of suggested articles to return. Default: 5, Maximum: 10. Controls how many article suggestions are included in the response.',
      ),
    topics: z
      .string()
      .optional()
      .describe(
        'Knowledge article topic names to filter results. Provide topic names to narrow down the search to articles tagged with specific topics.',
      ),
    channel: z
      .enum(['Pkb', 'Csp', 'Prm', 'App'])
      .optional()
      .describe(
        "The channel for which the article is visible. Valid values: 'Pkb' (Public Knowledge Base), 'Csp' (Customer Portal), 'Prm' (Partner Portal), 'App' (Application).",
      ),
    language: z
      .string()
      .describe(
        "The article language API name (e.g., 'en_US', 'fr_FR', 'de_DE'). REQUIRED by the suggestTitleMatches API — omitting it returns HTTP 400.",
      ),
    publishStatus: z
      .enum(['Draft', 'Online', 'Archived'])
      .describe(
        "The article publication status. Valid values: 'Draft', 'Online', 'Archived'. REQUIRED by the suggestTitleMatches API — omitting it returns HTTP 400.",
      ),
    validationStatus: z
      .enum(['Draft', 'Validated', 'Published'])
      .optional()
      .describe(
        "The article's validation status. Valid values: 'Draft', 'Validated', 'Published'. Filters results by the article's validation state.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    q,
    limit,
    topics,
    channel,
    language,
    publishStatus,
    validationStatus,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/search/suggestTitleMatches`, {
      query: {
        q: q,
        limit: limit,
        topics: topics,
        channel: channel,
        language: language,
        publishStatus: publishStatus,
        validationStatus: validationStatus,
      },
    });
  },
});

export const salesforceSobjectUserPassword = tool({
  description:
    "Tool to check whether a Salesforce user's password has expired. Use when you need to verify password expiration status for a specific user.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    userId: z
      .string()
      .describe(
        'The 15 or 18-character Salesforce User ID to check password expiration status for.',
      ),
  }),
  execute: async ({ salesforceCredentials, userId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/User/${userId}/password`);
  },
});

export const salesforceUpdateFavorite = tool({
  description:
    "Tool to update a favorite's properties in Salesforce UI API. Use when you need to reorder favorites or modify their display properties.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    name: z
      .string()
      .optional()
      .describe(
        'The display name of the favorite. Update this to change how the favorite appears in the list.',
      ),
    sortOrder: z
      .number()
      .int()
      .optional()
      .describe(
        "The display order/position of the favorite in the user's favorites list. Lower numbers appear first. Used to reorder favorites.",
      ),
    favoriteId: z
      .string()
      .describe('The unique 15 or 18-character Salesforce ID of the favorite to update.'),
  }),
  execute: async ({ salesforceCredentials, name, sortOrder, favoriteId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPatch(salesforceCredentials, `/ui-api/favorites/${favoriteId}`, {
      body: { name: name, sortOrder: sortOrder },
    });
  },
});
