// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { digitalOceanRequest, missingKey, toDigitalOceanError } from './client.js';

const authField = {
  digitalOceanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

const paginationFields = {
  page: z.number().int().min(1).optional().describe('Page of results to return (>= 1)'),
  perPage: z.number().int().min(1).max(200).optional().describe('Number of items per page (1-200)'),
};

export const digitalOceanCreateDatabaseCluster = tool({
  description:
    'Provision a managed database cluster (PostgreSQL, MySQL, Valkey, MongoDB, Kafka, OpenSearch) with engine, version, region, size, and node count. Returns connection credentials; the cluster starts in creating status and takes minutes to come online.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('Cluster name'),
    engine: z
      .enum(['pg', 'mysql', 'valkey', 'mongodb', 'kafka', 'opensearch'])
      .describe('Database engine'),
    version: z.string().describe("Engine version (e.g. '16' for PostgreSQL, '8' for MySQL/Valkey)"),
    region: z.string().describe("Region slug (e.g. 'nyc1', 'sfo3', 'fra1')"),
    size: z.string().describe("Node size slug (e.g. 'db-s-1vcpu-1gb')"),
    numNodes: z
      .number()
      .int()
      .min(1)
      .describe('Node count: 1 single node, 2 primary+standby, 3 high availability'),
    tags: z.array(z.string()).optional().describe('Tags for the cluster'),
    dbNames: z.array(z.string()).optional().describe('Databases to create in the cluster'),
    userNames: z.array(z.string()).optional().describe('Users to create in the cluster'),
    sqlMode: z.string().optional().describe('SQL mode for MySQL clusters'),
    evictionPolicy: z.string().optional().describe('Eviction policy for Valkey/Redis clusters'),
    storageSizeGb: z.number().int().min(1).optional().describe('Extra storage in GiB'),
    privateNetworkUuid: z.string().optional().describe('VPC UUID for private networking'),
    maintenanceWindow: z
      .object({
        day: z.string().describe('Maintenance day (monday-sunday) or empty string'),
        hour: z.string().describe('Maintenance time HH:MM:SS or empty string'),
        pending: z.boolean().describe('Whether the window is pending application'),
      })
      .optional()
      .describe('Maintenance window configuration'),
    backupRestore: z
      .object({
        clusterId: z.string().describe('Source cluster ID to restore from'),
        snapshot: z.string().describe('Snapshot timestamp in ISO8601 format'),
      })
      .optional()
      .describe('Restore the new cluster from a backup'),
  }),
  execute: async ({
    digitalOceanApiKey,
    name,
    engine,
    version,
    region,
    size,
    numNodes,
    tags,
    dbNames,
    userNames,
    sqlMode,
    evictionPolicy,
    storageSizeGb,
    privateNetworkUuid,
    maintenanceWindow,
    backupRestore,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/databases', {
        body: {
          name,
          engine,
          version,
          region,
          size,
          num_nodes: numNodes,
          ...(tags !== undefined ? { tags } : {}),
          ...(dbNames !== undefined ? { db_names: dbNames } : {}),
          ...(userNames !== undefined ? { user_names: userNames } : {}),
          ...(sqlMode !== undefined ? { sql_mode: sqlMode } : {}),
          ...(evictionPolicy !== undefined ? { eviction_policy: evictionPolicy } : {}),
          ...(storageSizeGb !== undefined ? { storage_size_gb: storageSizeGb } : {}),
          ...(privateNetworkUuid !== undefined ? { private_network_uuid: privateNetworkUuid } : {}),
          ...(maintenanceWindow !== undefined
            ? {
                maintenance_window: {
                  day: maintenanceWindow.day,
                  hour: maintenanceWindow.hour,
                  pending: maintenanceWindow.pending,
                },
              }
            : {}),
          ...(backupRestore !== undefined
            ? {
                backup_restore: {
                  database_name: backupRestore.clusterId,
                  backup_created_at: backupRestore.snapshot,
                },
              }
            : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create database cluster');
    }
  },
});

export const digitalOceanListDatabases = tool({
  description:
    'List managed database clusters with pagination and optional tag filter. Iterate page/per_page to retrieve every cluster.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
    tagName: z.string().optional().describe('Only return clusters with this tag'),
  }),
  execute: async ({ digitalOceanApiKey, page, perPage, tagName }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/databases', {
        query: { page, per_page: perPage, tag_name: tagName },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list databases');
    }
  },
});

export const digitalOceanDeleteDatabaseCluster = tool({
  description:
    'Permanently destroy a managed database cluster by UUID. Confirm it is no longer needed — all data is lost.',
  inputSchema: z.object({
    ...authField,
    databaseClusterUuid: z.string().describe('UUID of the database cluster to destroy'),
  }),
  execute: async ({ digitalOceanApiKey, databaseClusterUuid }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/databases/${databaseClusterUuid}`);
      return { success: true, message: `Database cluster ${databaseClusterUuid} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete database cluster');
    }
  },
});

export const digitalOceanListDatabaseOptions = tool({
  description:
    'List valid engines, versions, regions, and sizes/layouts for new database clusters. Call this to discover allowed values before creating a cluster.',
  inputSchema: z.object({
    ...authField,
  }),
  execute: async ({ digitalOceanApiKey }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/databases/options');
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list database options');
    }
  },
});
