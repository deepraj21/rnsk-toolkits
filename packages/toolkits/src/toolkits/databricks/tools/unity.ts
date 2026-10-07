// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );
const pagingFields = {
  maxResults: z.number().int().min(1).optional().describe('Maximum results per page'),
  pageToken: z.string().optional().describe('Page token from a previous response'),
};

export const databricksListCatalogs = tool({
  description: 'List Unity Catalog catalogs visible to the caller. Use to discover data domains.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/catalogs');
      if (!result.ok) return failedResult('Failed to list catalogs', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing catalogs');
    }
  },
});

export const databricksGetCatalog = tool({
  description: 'Get one Unity Catalog catalog with owner, storage, and isolation mode.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    catalogName: z.string().describe('Catalog name'),
  }),
  execute: async ({ databricksCredentials, catalogName }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.1/unity-catalog/catalogs/${catalogName}`,
      );
      if (!result.ok) return failedResult('Failed to get catalog', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting catalog');
    }
  },
});

export const databricksCreateCatalog = tool({
  description:
    'Create a Unity Catalog catalog (managed or external with storage location). Requires metastore admin or CREATE CATALOG privilege.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    catalog: z
      .record(z.string(), z.any())
      .describe(
        'Catalog object: name, comment, storage_root (external), provider_name (Delta Sharing), properties',
      ),
  }),
  execute: async ({ databricksCredentials, catalog }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/catalogs', {
        method: 'POST',
        body: catalog,
      });
      if (!result.ok) return failedResult('Failed to create catalog', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating catalog');
    }
  },
});

export const databricksUpdateCatalog = tool({
  description: 'Update a catalog: rename, change owner, comment, or isolation mode.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    catalogName: z.string().describe('Catalog name'),
    catalog: z.record(z.string(), z.any()).describe('Fields to update: new_name, owner, comment'),
  }),
  execute: async ({ databricksCredentials, catalogName, catalog }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.1/unity-catalog/catalogs/${catalogName}`,
        { method: 'PATCH', body: catalog },
      );
      if (!result.ok) return failedResult('Failed to update catalog', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating catalog');
    }
  },
});

export const databricksDeleteCatalog = tool({
  description: 'Delete a catalog. Force removes contents when set.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    catalogName: z.string().describe('Catalog name'),
    force: z.boolean().optional().describe('Force-delete including all schemas and tables'),
  }),
  execute: async ({ databricksCredentials, catalogName, force }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.1/unity-catalog/catalogs/${catalogName}`,
        { method: 'DELETE', query: { force } },
      );
      if (!result.ok) return failedResult('Failed to delete catalog', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting catalog');
    }
  },
});

export const databricksListSchemas = tool({
  description: 'List schemas in a Unity Catalog catalog.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    catalogName: z.string().describe('Catalog name'),
    ...pagingFields,
  }),
  execute: async ({ databricksCredentials, catalogName, maxResults, pageToken }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/schemas', {
        query: {
          catalog_name: catalogName,
          max_results: maxResults,
          page_token: pageToken,
        },
      });
      if (!result.ok) return failedResult('Failed to list schemas', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing schemas');
    }
  },
});

export const databricksCreateSchema = tool({
  description: 'Create a schema in a Unity Catalog catalog (managed or external).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    schema: z
      .record(z.string(), z.any())
      .describe('Schema object: name, catalog_name, comment, storage_root (external), properties'),
  }),
  execute: async ({ databricksCredentials, schema }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/schemas', {
        method: 'POST',
        body: schema,
      });
      if (!result.ok) return failedResult('Failed to create schema', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating schema');
    }
  },
});

export const databricksDeleteSchema = tool({
  description: 'Delete a schema. Force removes tables and volumes when set.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    fullName: z.string().describe('Full schema name catalog.schema'),
    force: z.boolean().optional().describe('Force-delete contents'),
  }),
  execute: async ({ databricksCredentials, fullName, force }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.1/unity-catalog/schemas/${fullName}`,
        { method: 'DELETE', query: { force } },
      );
      if (!result.ok) return failedResult('Failed to delete schema', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting schema');
    }
  },
});

export const databricksListTables = tool({
  description: 'List tables and views in a catalog schema. Use to discover datasets for queries.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    catalogName: z.string().describe('Catalog name'),
    schemaName: z.string().describe('Schema name'),
    ...pagingFields,
  }),
  execute: async ({ databricksCredentials, catalogName, schemaName, maxResults, pageToken }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/tables', {
        query: {
          catalog_name: catalogName,
          schema_name: schemaName,
          max_results: maxResults,
          page_token: pageToken,
        },
      });
      if (!result.ok) return failedResult('Failed to list tables', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing tables');
    }
  },
});

export const databricksGetTable = tool({
  description:
    'Get one table with columns, type, storage location, and Delta properties. Use to inspect dataset shape.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    fullName: z.string().describe('Full table name catalog.schema.table'),
  }),
  execute: async ({ databricksCredentials, fullName }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.1/unity-catalog/tables/${fullName}`,
      );
      if (!result.ok) return failedResult('Failed to get table', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting table');
    }
  },
});

export const databricksDeleteTable = tool({
  description: 'Delete a table (drops data for managed tables).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    fullName: z.string().describe('Full table name catalog.schema.table'),
  }),
  execute: async ({ databricksCredentials, fullName }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.1/unity-catalog/tables/${fullName}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete table', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting table');
    }
  },
});

export const databricksListVolumes = tool({
  description: 'List Unity Catalog volumes (non-tabular storage) in a schema.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    catalogName: z.string().describe('Catalog name'),
    schemaName: z.string().describe('Schema name'),
    ...pagingFields,
  }),
  execute: async ({ databricksCredentials, catalogName, schemaName, maxResults, pageToken }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/volumes', {
        query: {
          catalog_name: catalogName,
          schema_name: schemaName,
          max_results: maxResults,
          page_token: pageToken,
        },
      });
      if (!result.ok) return failedResult('Failed to list volumes', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing volumes');
    }
  },
});

export const databricksGetGrants = tool({
  description:
    'Get privilege grants on a securable (catalog, schema, table, volume, warehouse). Use to audit data access.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    securableType: z
      .string()
      .describe('Securable type, e.g. catalog, schema, table, volume, warehouse'),
    fullName: z.string().describe('Full securable name (empty for metastore)'),
  }),
  execute: async ({ databricksCredentials, securableType, fullName }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/grants', {
        query: { securable_type: securableType, full_name: fullName },
      });
      if (!result.ok) return failedResult('Failed to get grants', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting grants');
    }
  },
});

export const databricksUpdateGrants = tool({
  description:
    'Grant or revoke privileges on a securable via add/remove changes. Use to manage data access.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    securableType: z.string().describe('Securable type, e.g. table, schema, catalog'),
    fullName: z.string().describe('Full securable name'),
    changes: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Changes [{principal, add:["SELECT"], remove:["MODIFY"]}]'),
  }),
  execute: async ({ databricksCredentials, securableType, fullName, changes }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/unity-catalog/grants', {
        method: 'PATCH',
        body: { securable_type: securableType, full_name: fullName, changes },
      });
      if (!result.ok) return failedResult('Failed to update grants', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating grants');
    }
  },
});
