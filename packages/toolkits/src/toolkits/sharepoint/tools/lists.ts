// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, failedResult, toSharePointError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const siteIdField = z.string().describe('SharePoint site ID — get it from sharepointSearchSites');
const listIdField = z.string().describe('List GUID — get it from sharepointListLists');
const itemIdField = z.string().describe('List item ID (integer as string, e.g. "42")');

export const sharepointListLists = tool({
  description:
    'List every SharePoint list and document library in a site, with template type and item counts.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    filter: z.string().optional().describe('OData filter, e.g. list/template eq 100'),
    select: z.string().optional().describe('Comma-separated fields to return'),
    expand: z.string().optional().describe('Related resources to expand, e.g. columns,items'),
  }),
  execute: async ({ sharepointToken, siteId, filter, select, expand }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/lists`, {
        query: { $filter: filter, $select: select, $expand: expand },
      });
      if (!result.ok) return failedResult('Failed to list lists', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing lists');
    }
  },
});

export const sharepointGetList = tool({
  description: 'Get one SharePoint list: display name, columns, content type, and settings.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    select: z.string().optional().describe('Comma-separated fields to return'),
    expand: z.string().optional().describe('Related resources to expand, e.g. columns,items'),
  }),
  execute: async ({ sharepointToken, siteId, listId, select, expand }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/lists/${listId}`, {
        query: { $select: select, $expand: expand },
      });
      if (!result.ok) return failedResult('Failed to get list', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error getting list');
    }
  },
});

export const sharepointCreateList = tool({
  description:
    'Create a SharePoint list from a template (generic list, document library, etc.), optionally defining its columns up front.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    displayName: z.string().describe('List title shown in SharePoint, e.g. "Purchase Requests"'),
    template: z
      .string()
      .optional()
      .describe('List template GUID, e.g. genericList (default), documentLibrary, tasks, announcements'),
    description: z.string().optional().describe('List description'),
    columns: z
      .array(z.record(z.any()))
      .optional()
      .describe('Column definitions, e.g. [{name:"Amount", number:{}},{name:"Owner", text:{}}]'),
  }),
  execute: async ({ sharepointToken, siteId, displayName, template, description, columns }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/lists`, {
        method: 'POST',
        body: {
          displayName,
          ...(description ? { description } : {}),
          ...(columns ? { columns } : {}),
          list: { template: template ?? 'genericList' },
        },
      });
      if (!result.ok) return failedResult('Failed to create list', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error creating list');
    }
  },
});

export const sharepointUpdateList = tool({
  description: 'Rename a SharePoint list or change its description.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    displayName: z.string().optional().describe('New list title'),
    description: z.string().optional().describe('New list description'),
  }),
  execute: async ({ sharepointToken, siteId, listId, displayName, description }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/lists/${listId}`, {
        method: 'PATCH',
        body: {
          ...(displayName ? { displayName } : {}),
          ...(description ? { description } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update list', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error updating list');
    }
  },
});

export const sharepointDeleteList = tool({
  description: 'Delete a SharePoint list permanently (its items are removed with it).',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
  }),
  execute: async ({ sharepointToken, siteId, listId }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/lists/${listId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete list', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toSharePointError(error, 'Error deleting list');
    }
  },
});

export const sharepointListListItems = tool({
  description:
    'List rows (list items) in a SharePoint list with OData filtering, field selection, and paging via the returned next link.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    filter: z.string().optional().describe('OData filter, e.g. fields/Status eq "Open"'),
    select: z.string().optional().describe('Comma-separated fields to return'),
    expand: z.string().optional().describe('Related resources to expand, e.g. fields'),
  }),
  execute: async ({ sharepointToken, siteId, listId, filter, select, expand }) => {
    try {
      const result = await graphRequest(
        sharepointToken,
        `/sites/${siteId}/lists/${listId}/items`,
        { query: { $filter: filter, $select: select, $expand: expand } },
      );
      if (!result.ok) return failedResult('Failed to list list items', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing list items');
    }
  },
});

export const sharepointGetListItem = tool({
  description: 'Get one list row with its column values (expand fields to read all columns).',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    itemId: itemIdField,
    select: z.string().optional().describe('Comma-separated fields to return'),
    expand: z.string().optional().describe('Related resources to expand, e.g. fields'),
  }),
  execute: async ({ sharepointToken, siteId, listId, itemId, select, expand }) => {
    try {
      const result = await graphRequest(
        sharepointToken,
        `/sites/${siteId}/lists/${listId}/items/${itemId}`,
        { query: { $select: select, $expand: expand } },
      );
      if (!result.ok) return failedResult('Failed to get list item', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error getting list item');
    }
  },
});

export const sharepointCreateListItem = tool({
  description: 'Add a row to a SharePoint list. Provide column values as a flat fields object keyed by internal column name.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    fields: z
      .record(z.any())
      .describe('Column values, e.g. {Title: "Vendor onboarding", Status: "Open"}'),
  }),
  execute: async ({ sharepointToken, siteId, listId, fields }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/lists/${listId}/items`, {
        method: 'POST',
        body: { fields },
      });
      if (!result.ok) return failedResult('Failed to create list item', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error creating list item');
    }
  },
});

export const sharepointUpdateListItem = tool({
  description:
    'Update column values on an existing list row. Only the fields you pass are changed; others keep their values.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    itemId: itemIdField,
    fields: z
      .record(z.any())
      .describe('Column values to set, e.g. {Status: "Closed", Priority: "High"}'),
  }),
  execute: async ({ sharepointToken, siteId, listId, itemId, fields }) => {
    try {
      const result = await graphRequest(
        sharepointToken,
        `/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
        { method: 'PATCH', body: fields },
      );
      if (!result.ok) return failedResult('Failed to update list item', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error updating list item');
    }
  },
});

export const sharepointDeleteListItem = tool({
  description: 'Delete a row from a SharePoint list.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    itemId: itemIdField,
  }),
  execute: async ({ sharepointToken, siteId, listId, itemId }) => {
    try {
      const result = await graphRequest(
        sharepointToken,
        `/sites/${siteId}/lists/${listId}/items/${itemId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete list item', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toSharePointError(error, 'Error deleting list item');
    }
  },
});

export const sharepointGetListItemVersions = tool({
  description:
    'List version history of a list item: version IDs, editors, and timestamps (useful for audit and restore workflows).',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    itemId: itemIdField,
  }),
  execute: async ({ sharepointToken, siteId, listId, itemId }) => {
    try {
      const result = await graphRequest(
        sharepointToken,
        `/sites/${siteId}/lists/${listId}/items/${itemId}/versions`,
      );
      if (!result.ok) return failedResult('Failed to list item versions', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing item versions');
    }
  },
});

export const sharepointListListColumns = tool({
  description:
    'List the columns (schema) of a SharePoint list so you know the exact internal field names to use when creating or updating rows.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    listId: listIdField,
    select: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({ sharepointToken, siteId, listId, select }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/lists/${listId}/columns`, {
        query: { $select: select },
      });
      if (!result.ok) return failedResult('Failed to list columns', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing columns');
    }
  },
});
