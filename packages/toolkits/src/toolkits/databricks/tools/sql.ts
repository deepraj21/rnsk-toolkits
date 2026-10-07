// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );

export const databricksListWarehouses = tool({
  description:
    'List SQL warehouses the caller can access. Use to discover warehouse IDs for queries.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/sql/warehouses');
      if (!result.ok) return failedResult('Failed to list warehouses', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing warehouses');
    }
  },
});

export const databricksGetWarehouse = tool({
  description: 'Get full configuration and state of one SQL warehouse.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    warehouseId: z.string().describe('Warehouse ID'),
  }),
  execute: async ({ databricksCredentials, warehouseId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/warehouses/${warehouseId}`,
      );
      if (!result.ok) return failedResult('Failed to get warehouse', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting warehouse');
    }
  },
});

export const databricksCreateWarehouse = tool({
  description:
    'Create a SQL warehouse. Needs name and cluster_size (e.g. Small, Medium); see Databricks docs for sizing and warehouse types.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    warehouse: z
      .record(z.string(), z.any())
      .describe(
        'Warehouse spec: name, cluster_size, min_num_clusters, max_num_clusters, auto_stop_mins, warehouse_type, photon, tags',
      ),
  }),
  execute: async ({ databricksCredentials, warehouse }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/sql/warehouses', {
        method: 'POST',
        body: warehouse,
      });
      if (!result.ok) return failedResult('Failed to create warehouse', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating warehouse');
    }
  },
});

export const databricksEditWarehouse = tool({
  description: 'Edit a SQL warehouse configuration (applies on next restart).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    warehouseId: z.string().describe('Warehouse ID'),
    warehouse: z.record(z.string(), z.any()).describe('Warehouse fields to update'),
  }),
  execute: async ({ databricksCredentials, warehouseId, warehouse }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/warehouses/${warehouseId}/edit`,
        { method: 'POST', body: warehouse },
      );
      if (!result.ok) return failedResult('Failed to edit warehouse', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error editing warehouse');
    }
  },
});

export const databricksDeleteWarehouse = tool({
  description: 'Delete a SQL warehouse. Running queries are cancelled.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    warehouseId: z.string().describe('Warehouse ID'),
  }),
  execute: async ({ databricksCredentials, warehouseId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/warehouses/${warehouseId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete warehouse', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting warehouse');
    }
  },
});

export const databricksStartWarehouse = tool({
  description: 'Start a stopped SQL warehouse.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    warehouseId: z.string().describe('Warehouse ID'),
  }),
  execute: async ({ databricksCredentials, warehouseId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/warehouses/${warehouseId}/start`,
        { method: 'POST', body: {} },
      );
      if (!result.ok) return failedResult('Failed to start warehouse', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error starting warehouse');
    }
  },
});

export const databricksStopWarehouse = tool({
  description: 'Stop a running SQL warehouse to save cost.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    warehouseId: z.string().describe('Warehouse ID'),
  }),
  execute: async ({ databricksCredentials, warehouseId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/warehouses/${warehouseId}/stop`,
        { method: 'POST', body: {} },
      );
      if (!result.ok) return failedResult('Failed to stop warehouse', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error stopping warehouse');
    }
  },
});

export const databricksExecuteStatement = tool({
  description:
    'Run a SQL statement on a warehouse and wait for results (inline up to the wait timeout). Use for ad-hoc analytics queries.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    warehouseId: z.string().describe('Warehouse ID to run on'),
    statement: z.string().describe('SQL statement text'),
    catalog: z.string().optional().describe('Unity Catalog catalog for unqualified names'),
    schema: z.string().optional().describe('Schema for unqualified names'),
    parameters: z
      .array(z.record(z.string(), z.any()))
      .optional()
      .describe('Statement parameters [{name, value, type}] for :named markers'),
    waitTimeout: z
      .string()
      .optional()
      .describe('Time to wait inline, e.g. "30s" or "5m" (default server-side 10s)'),
    rowLimit: z.number().int().min(1).optional().describe('Maximum rows to return inline'),
  }),
  execute: async ({
    databricksCredentials,
    warehouseId,
    statement,
    catalog,
    schema,
    parameters,
    waitTimeout,
    rowLimit,
  }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/sql/statements', {
        method: 'POST',
        body: {
          warehouse_id: warehouseId,
          statement,
          ...(catalog !== undefined ? { catalog } : {}),
          ...(schema !== undefined ? { schema } : {}),
          ...(parameters !== undefined ? { parameters } : {}),
          ...(waitTimeout !== undefined ? { wait_timeout: waitTimeout } : {}),
          ...(rowLimit !== undefined ? { row_limit: rowLimit } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to execute statement', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error executing statement');
    }
  },
});

export const databricksGetStatement = tool({
  description: 'Get status and results of an executed SQL statement (poll after async execution).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    statementId: z.string().describe('Statement ID from Execute Statement'),
  }),
  execute: async ({ databricksCredentials, statementId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/statements/${statementId}`,
      );
      if (!result.ok) return failedResult('Failed to get statement', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting statement');
    }
  },
});

export const databricksGetStatementResultChunk = tool({
  description: 'Fetch one result chunk of a large statement result set by chunk index.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    statementId: z.string().describe('Statement ID'),
    chunkIndex: z.number().int().min(0).describe('Zero-based chunk index'),
  }),
  execute: async ({ databricksCredentials, statementId, chunkIndex }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/statements/${statementId}/result/chunks/${chunkIndex}`,
      );
      if (!result.ok) return failedResult('Failed to get result chunk', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting result chunk');
    }
  },
});

export const databricksCancelStatement = tool({
  description: 'Cancel a running SQL statement.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    statementId: z.string().describe('Statement ID'),
  }),
  execute: async ({ databricksCredentials, statementId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/statements/${statementId}/cancel`,
        { method: 'POST', body: {} },
      );
      if (!result.ok) return failedResult('Failed to cancel statement', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error canceling statement');
    }
  },
});

export const databricksListQueries = tool({
  description: 'List saved SQL queries with optional search, ordering, and pagination.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    search: z.string().optional().describe('Search string on query name/description'),
    page: z.number().int().min(1).optional().describe('Page number'),
    pageSize: z.number().int().min(1).optional().describe('Queries per page'),
    order: z.string().optional().describe('Sort, e.g. "name" or "-created_at"'),
  }),
  execute: async ({ databricksCredentials, search, page, pageSize, order }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/sql/queries', {
        query: { q: search, page, page_size: pageSize, order },
      });
      if (!result.ok) return failedResult('Failed to list queries', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing queries');
    }
  },
});

export const databricksGetQuery = tool({
  description: 'Get one saved SQL query with its SQL text and data source.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    queryId: z.string().describe('Query ID'),
  }),
  execute: async ({ databricksCredentials, queryId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/sql/queries/${queryId}`);
      if (!result.ok) return failedResult('Failed to get query', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting query');
    }
  },
});

export const databricksCreateQuery = tool({
  description: 'Save a new SQL query (name, SQL text, data source/warehouse ID).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    query: z
      .record(z.string(), z.any())
      .describe(
        'Query object: name, query (SQL text), data_source_id (warehouse ID), description, options',
      ),
  }),
  execute: async ({ databricksCredentials, query }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/sql/queries', {
        method: 'POST',
        body: query,
      });
      if (!result.ok) return failedResult('Failed to create query', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating query');
    }
  },
});

export const databricksUpdateQuery = tool({
  description: 'Update a saved SQL query by ID.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    queryId: z.string().describe('Query ID'),
    query: z.record(z.string(), z.any()).describe('Query fields to update'),
  }),
  execute: async ({ databricksCredentials, queryId, query }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/sql/queries/${queryId}`, {
        method: 'POST',
        body: query,
      });
      if (!result.ok) return failedResult('Failed to update query', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating query');
    }
  },
});

export const databricksDeleteQuery = tool({
  description: 'Delete a saved SQL query by ID.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    queryId: z.string().describe('Query ID'),
  }),
  execute: async ({ databricksCredentials, queryId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/sql/queries/${queryId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete query', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting query');
    }
  },
});

export const databricksListAlerts = tool({
  description: 'List SQL alerts with optional state filter.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/sql/alerts');
      if (!result.ok) return failedResult('Failed to list alerts', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing alerts');
    }
  },
});

export const databricksGetAlert = tool({
  description: 'Get one SQL alert with its query, condition, and notification settings.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    alertId: z.string().describe('Alert ID'),
  }),
  execute: async ({ databricksCredentials, alertId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/sql/alerts/${alertId}`);
      if (!result.ok) return failedResult('Failed to get alert', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting alert');
    }
  },
});

export const databricksListDashboards = tool({
  description: 'List legacy SQL dashboards.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/sql/dashboards');
      if (!result.ok) return failedResult('Failed to list dashboards', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing dashboards');
    }
  },
});

export const databricksGetDashboard = tool({
  description: 'Get one legacy SQL dashboard with its widgets.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    dashboardId: z.string().describe('Dashboard ID'),
  }),
  execute: async ({ databricksCredentials, dashboardId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/sql/dashboards/${dashboardId}`,
      );
      if (!result.ok) return failedResult('Failed to get dashboard', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting dashboard');
    }
  },
});
