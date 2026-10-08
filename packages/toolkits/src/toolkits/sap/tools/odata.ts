// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sapRequest, failedResult, toSapError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const pathField = z
  .string()
  .describe('OData path, e.g. /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner');

export const sapODataGet = tool({
  description:
    'HTTP GET on an SAP OData resource with optional $filter, $top, $skip, $select, $expand, $orderby query parameters.',
  inputSchema: z.object({
    sapCredentials: credField,
    path: pathField,
    filter: z.string().optional().describe('OData $filter expression'),
    top: z.number().int().optional(),
    skip: z.number().int().optional(),
    select: z.string().optional(),
    expand: z.string().optional(),
    orderby: z.string().optional(),
    inlinecount: z.string().optional().describe('$inlinecount value, e.g. allpages'),
  }),
  execute: async ({
    sapCredentials,
    path,
    filter,
    top,
    skip,
    select,
    expand,
    orderby,
    inlinecount,
  }) => {
    try {
      const result = await sapRequest(sapCredentials, path, {
        query: {
          $filter: filter,
          $top: top,
          $skip: skip,
          $select: select,
          $expand: expand,
          $orderby: orderby,
          $inlinecount: inlinecount,
        },
      });
      if (!result.ok) return failedResult('SAP OData GET failed', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error in SAP OData GET');
    }
  },
});

export const sapODataCreate = tool({
  description: 'Create an OData entity (POST). CSRF token is fetched automatically.',
  inputSchema: z.object({
    sapCredentials: credField,
    path: pathField,
    entity: z.record(z.string(), z.any()).describe('Entity JSON body'),
  }),
  execute: async ({ sapCredentials, path, entity }) => {
    try {
      const result = await sapRequest(sapCredentials, path, { method: 'POST', body: entity });
      if (!result.ok) return failedResult('SAP OData POST failed', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error in SAP OData POST');
    }
  },
});

export const sapODataUpdate = tool({
  description: 'Update an OData entity (PATCH). CSRF token is fetched automatically.',
  inputSchema: z.object({
    sapCredentials: credField,
    path: z.string().describe("Entity path including key, e.g. .../A_BusinessPartner('1000')"),
    entity: z.record(z.string(), z.any()).describe('Fields to patch'),
  }),
  execute: async ({ sapCredentials, path, entity }) => {
    try {
      const result = await sapRequest(sapCredentials, path, { method: 'PATCH', body: entity });
      if (!result.ok) return failedResult('SAP OData PATCH failed', result);
      return result.data ?? { updated: true };
    } catch (error) {
      return toSapError(error, 'Error in SAP OData PATCH');
    }
  },
});

export const sapODataDelete = tool({
  description: 'Delete an OData entity (DELETE). CSRF token is fetched automatically.',
  inputSchema: z.object({
    sapCredentials: credField,
    path: z.string().describe('Entity path including key'),
  }),
  execute: async ({ sapCredentials, path }) => {
    try {
      const result = await sapRequest(sapCredentials, path, { method: 'DELETE' });
      if (!result.ok) return failedResult('SAP OData DELETE failed', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toSapError(error, 'Error in SAP OData DELETE');
    }
  },
});

export const sapGetServiceMetadata = tool({
  description: 'Fetch OData service metadata document ($metadata) for discovery.',
  inputSchema: z.object({
    sapCredentials: credField,
    servicePath: z.string().describe('Service root, e.g. /sap/opu/odata/sap/API_BUSINESS_PARTNER'),
  }),
  execute: async ({ sapCredentials, servicePath }) => {
    try {
      const base = servicePath.replace(/\/+$/, '');
      const result = await sapRequest(sapCredentials, `${base}/$metadata`, {
        skipCsrf: true,
      });
      if (!result.ok) return failedResult('Failed to fetch SAP service metadata', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error fetching SAP metadata');
    }
  },
});
