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

const nodePool = z.object({
  name: z.string().describe('Node pool name'),
  size: z.string().describe("Droplet size slug (e.g. 's-1vcpu-2gb', 's-2vcpu-4gb')"),
  count: z.number().int().min(1).describe('Number of nodes in the pool'),
  tags: z.array(z.string()).optional().describe('Tags for nodes in this pool'),
  labels: z.record(z.string()).optional().describe('Key-value labels for nodes'),
  taints: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        effect: z.enum(['NoSchedule', 'PreferNoSchedule', 'NoExecute']),
      }),
    )
    .optional()
    .describe('Kubernetes taints for nodes'),
  autoScale: z.boolean().optional().describe('Enable auto-scaling for this pool'),
  minNodes: z.number().int().min(1).optional().describe('Minimum nodes for auto-scaling'),
  maxNodes: z.number().int().min(1).optional().describe('Maximum nodes for auto-scaling'),
});

export const digitalOceanCreateKubernetesCluster = tool({
  description:
    'Create a managed Kubernetes (DOKS) cluster with name, region, version, and at least one node pool. Starts in provisioning state and takes minutes to run. List Kubernetes options first for valid regions, versions, and sizes.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('Cluster name'),
    region: z.string().describe("Region slug (e.g. 'nyc1', 'sfo3', 'lon1')"),
    version: z.string().describe("Kubernetes version slug (e.g. '1.34.1-do.3')"),
    nodePools: z.array(nodePool).min(1).describe('Node pools; at least one required'),
    tags: z.array(z.string()).optional().describe('Tags for the cluster'),
    autoUpgrade: z.boolean().optional().describe('Auto-upgrade to new patch releases'),
    maintenancePolicy: z
      .object({
        day: z
          .enum([
            'any',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ])
          .describe('Maintenance day'),
        startTime: z.string().describe("Maintenance start in 24-hour format (e.g. '15:04')"),
      })
      .optional()
      .describe('Scheduled maintenance policy'),
  }),
  execute: async ({
    digitalOceanApiKey,
    name,
    region,
    version,
    nodePools,
    tags,
    autoUpgrade,
    maintenancePolicy,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/kubernetes/clusters', {
        body: {
          name,
          region,
          version,
          node_pools: nodePools.map(
            ({ autoScale, minNodes, maxNodes, startTime, ...pool }: any) => ({
              ...pool,
              ...(autoScale !== undefined ? { auto_scale: autoScale } : {}),
              ...(minNodes !== undefined ? { min_nodes: minNodes } : {}),
              ...(maxNodes !== undefined ? { max_nodes: maxNodes } : {}),
            }),
          ),
          ...(tags !== undefined ? { tags } : {}),
          ...(autoUpgrade !== undefined ? { auto_upgrade: autoUpgrade } : {}),
          ...(maintenancePolicy !== undefined
            ? {
                maintenance_policy: {
                  day: maintenancePolicy.day,
                  start_time: maintenancePolicy.startTime,
                },
              }
            : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create Kubernetes cluster');
    }
  },
});

export const digitalOceanListKubernetesClusters = tool({
  description:
    'List all Kubernetes clusters with node pools and status. Paginate through every page to enumerate each cluster.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
  }),
  execute: async ({ digitalOceanApiKey, page, perPage }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/kubernetes/clusters', {
        query: { page, per_page: perPage },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list Kubernetes clusters');
    }
  },
});
