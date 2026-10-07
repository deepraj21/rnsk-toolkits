// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );
const clusterIdField = z.string().describe('Cluster ID');

export const databricksListClusters = tool({
  description:
    'List pinned and active clusters plus clusters terminated in the last 30 days. Use to discover cluster IDs.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/list');
      if (!result.ok) return failedResult('Failed to list clusters', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing clusters');
    }
  },
});

export const databricksGetCluster = tool({
  description: 'Get full details of one cluster: state, runtime, workers, and config.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
  }),
  execute: async ({ databricksCredentials, clusterId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/get', {
        query: { cluster_id: clusterId },
      });
      if (!result.ok) return failedResult('Failed to get cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting cluster');
    }
  },
});

const clusterSpecField = z
  .record(z.string(), z.any())
  .describe(
    'Cluster spec: cluster_name, spark_version, node_type_id, num_workers or autoscale {min_workers,max_workers}, spark_conf, aws_attributes/azure_attributes/gcp_attributes, custom_tags, init_scripts, spark_env_vars',
  );

export const databricksCreateCluster = tool({
  description:
    'Create a new Spark cluster. Needs cluster_name, spark_version (see List Spark Versions), and node_type_id (see List Node Types).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    cluster: clusterSpecField,
  }),
  execute: async ({ databricksCredentials, cluster }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/create', {
        method: 'POST',
        body: cluster,
      });
      if (!result.ok) return failedResult('Failed to create cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating cluster');
    }
  },
});

export const databricksEditCluster = tool({
  description:
    'Edit a cluster configuration (applies on next restart). Include cluster_id plus the full desired spec.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
    cluster: clusterSpecField,
  }),
  execute: async ({ databricksCredentials, clusterId, cluster }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/edit', {
        method: 'POST',
        body: { cluster_id: clusterId, ...cluster },
      });
      if (!result.ok) return failedResult('Failed to edit cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error editing cluster');
    }
  },
});

export const databricksStartCluster = tool({
  description: 'Start a terminated cluster.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
  }),
  execute: async ({ databricksCredentials, clusterId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/start', {
        method: 'POST',
        body: { cluster_id: clusterId },
      });
      if (!result.ok) return failedResult('Failed to start cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error starting cluster');
    }
  },
});

export const databricksRestartCluster = tool({
  description: 'Restart a running cluster to pick up config or library changes.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
  }),
  execute: async ({ databricksCredentials, clusterId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/restart', {
        method: 'POST',
        body: { cluster_id: clusterId },
      });
      if (!result.ok) return failedResult('Failed to restart cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error restarting cluster');
    }
  },
});

export const databricksResizeCluster = tool({
  description: 'Resize a running cluster by fixed size or autoscale bounds.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
    numWorkers: z.number().int().min(0).optional().describe('Fixed worker count'),
    autoscale: z
      .object({ min_workers: z.number().int().min(0), max_workers: z.number().int().min(1) })
      .optional()
      .describe('Autoscaling bounds'),
  }),
  execute: async ({ databricksCredentials, clusterId, numWorkers, autoscale }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/resize', {
        method: 'POST',
        body: {
          cluster_id: clusterId,
          ...(numWorkers !== undefined ? { num_workers: numWorkers } : {}),
          ...(autoscale !== undefined ? { autoscale } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to resize cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error resizing cluster');
    }
  },
});

export const databricksTerminateCluster = tool({
  description:
    'Terminate (delete) a cluster; it stays recoverable for 30 days. Use to stop compute.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
  }),
  execute: async ({ databricksCredentials, clusterId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/delete', {
        method: 'POST',
        body: { cluster_id: clusterId },
      });
      if (!result.ok) return failedResult('Failed to terminate cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error terminating cluster');
    }
  },
});

export const databricksPermanentlyDeleteCluster = tool({
  description: 'Permanently delete a terminated cluster immediately. Cannot be undone.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
  }),
  execute: async ({ databricksCredentials, clusterId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/clusters/permanent-delete',
        {
          method: 'POST',
          body: { cluster_id: clusterId },
        },
      );
      if (!result.ok) return failedResult('Failed to permanently delete cluster', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error permanently deleting cluster');
    }
  },
});

export const databricksGetClusterEvents = tool({
  description:
    'Get cluster lifecycle events (creation, resizes, terminations) for debugging and auditing.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
    startTime: z.number().int().optional().describe('Range start in epoch milliseconds'),
    endTime: z.number().int().optional().describe('Range end in epoch milliseconds'),
    limit: z.number().int().min(1).optional().describe('Maximum events to return'),
  }),
  execute: async ({ databricksCredentials, clusterId, startTime, endTime, limit }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/events', {
        method: 'POST',
        body: {
          cluster_id: clusterId,
          ...(startTime !== undefined ? { start_time: startTime } : {}),
          ...(endTime !== undefined ? { end_time: endTime } : {}),
          ...(limit !== undefined ? { limit } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to get cluster events', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting cluster events');
    }
  },
});

export const databricksListSparkVersions = tool({
  description:
    'List available Databricks Runtime (Spark) versions. Use to pick spark_version for cluster creation.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/spark-versions');
      if (!result.ok) return failedResult('Failed to list Spark versions', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing Spark versions');
    }
  },
});

export const databricksListNodeTypes = tool({
  description:
    'List available VM node types with cores, memory, and sizes. Use to pick node_type_id for clusters.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/clusters/list-node-types',
      );
      if (!result.ok) return failedResult('Failed to list node types', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing node types');
    }
  },
});

export const databricksListZones = tool({
  description: 'List availability zones available for clusters in this workspace region.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/clusters/list-zones');
      if (!result.ok) return failedResult('Failed to list zones', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing zones');
    }
  },
});

export const databricksGetClusterLibraryStatus = tool({
  description: 'Get library installation statuses on a cluster.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
  }),
  execute: async ({ databricksCredentials, clusterId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/libraries/cluster-status',
        {
          query: { cluster_id: clusterId },
        },
      );
      if (!result.ok) return failedResult('Failed to get library status', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting library status');
    }
  },
});

export const databricksInstallLibraries = tool({
  description:
    'Install libraries (jar, egg, whl, pypi, maven, cran) on a running cluster. Takes effect without restart for most types.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
    libraries: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe(
        'Libraries, e.g. [{"pypi":{"package":"pandas"}}] or [{"maven":{"coordinates":"org:lib:1.0"}}]',
      ),
  }),
  execute: async ({ databricksCredentials, clusterId, libraries }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/libraries/install', {
        method: 'POST',
        body: { cluster_id: clusterId, libraries },
      });
      if (!result.ok) return failedResult('Failed to install libraries', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error installing libraries');
    }
  },
});

export const databricksUninstallLibraries = tool({
  description: 'Uninstall libraries from a cluster by their exact install specs.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    clusterId: clusterIdField,
    libraries: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Libraries to remove, matching the install specs'),
  }),
  execute: async ({ databricksCredentials, clusterId, libraries }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/libraries/uninstall', {
        method: 'POST',
        body: { cluster_id: clusterId, libraries },
      });
      if (!result.ok) return failedResult('Failed to uninstall libraries', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error uninstalling libraries');
    }
  },
});
