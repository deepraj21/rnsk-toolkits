// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, failedResult, toSharePointError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const siteIdField = z
  .string()
  .describe('SharePoint site ID (contoso.sharepoint.com,site-collection-id,site-id) — get it from searchSites');

export const sharepointSearchSites = tool({
  description:
    'Find SharePoint sites in the tenant by keyword. Use "*" as the search term to list every site the connected user can access.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    search: z.string().optional().describe('Keywords to match site titles/URLs, or "*" for all sites (default)'),
    filter: z.string().optional().describe('OData filter, e.g. siteCollection/root ne null'),
    select: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({ sharepointToken, search, filter, select }) => {
    try {
      const result = await graphRequest(sharepointToken, '/sites', {
        query: { search: search ?? '*', $filter: filter, $select: select },
      });
      if (!result.ok) return failedResult('Failed to search sites', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error searching sites');
    }
  },
});

export const sharepointGetSite = tool({
  description:
    'Get one SharePoint site by its Graph site ID: title, web URL, description, and site collection metadata.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    select: z.string().optional().describe('Comma-separated fields to return'),
    expand: z.string().optional().describe('Related resources to expand, e.g. siteCollection'),
  }),
  execute: async ({ sharepointToken, siteId, select, expand }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}`, {
        query: { $select: select, $expand: expand },
      });
      if (!result.ok) return failedResult('Failed to get site', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error getting site');
    }
  },
});

export const sharepointGetSiteByPath = tool({
  description:
    'Get a SharePoint site from its web URL: hostname plus server-relative path (e.g. contoso.sharepoint.com with /teams/hr). Use when you only know the site URL, not its ID.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    hostname: z.string().describe('SharePoint hostname, e.g. contoso.sharepoint.com'),
    serverRelativePath: z.string().describe('Server-relative site path, e.g. /teams/hr (use / for the root site)'),
    select: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({ sharepointToken, hostname, serverRelativePath, select }) => {
    try {
      const path = serverRelativePath === '/' ? `/sites/${hostname}` : `/sites/${hostname}:${serverRelativePath}`;
      const result = await graphRequest(sharepointToken, path, { query: { $select: select } });
      if (!result.ok) return failedResult('Failed to get site by path', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error getting site by path');
    }
  },
});

export const sharepointGetRootSite = tool({
  description: "Get the tenant's root SharePoint site (the organization's main site collection).",
  inputSchema: z.object({
    sharepointToken: tokenField,
    select: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({ sharepointToken, select }) => {
    try {
      const result = await graphRequest(sharepointToken, '/sites/root', {
        query: { $select: select },
      });
      if (!result.ok) return failedResult('Failed to get root site', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error getting root site');
    }
  },
});

export const sharepointListSubsites = tool({
  description: 'List the sub-sites nested under a SharePoint site (site hierarchy / navigation structure).',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
    select: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({ sharepointToken, siteId, select }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/sites`, {
        query: { $select: select },
      });
      if (!result.ok) return failedResult('Failed to list sub-sites', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing sub-sites');
    }
  },
});

export const sharepointListSiteDrives = tool({
  description:
    'List all document libraries (drives) in a SharePoint site, including non-default libraries such as Shared Documents or custom libraries.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
  }),
  execute: async ({ sharepointToken, siteId }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/drives`);
      if (!result.ok) return failedResult('Failed to list document libraries', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error listing document libraries');
    }
  },
});

export const sharepointGetSiteDrive = tool({
  description:
    'Get the default document library of a SharePoint site: quota, owner, drive type, and web URL. Start here before file operations when you have only a site ID.',
  inputSchema: z.object({
    sharepointToken: tokenField,
    siteId: siteIdField,
  }),
  execute: async ({ sharepointToken, siteId }) => {
    try {
      const result = await graphRequest(sharepointToken, `/sites/${siteId}/drive`);
      if (!result.ok) return failedResult('Failed to get site drive', result);
      return result.data;
    } catch (error) {
      return toSharePointError(error, 'Error getting site drive');
    }
  },
});
