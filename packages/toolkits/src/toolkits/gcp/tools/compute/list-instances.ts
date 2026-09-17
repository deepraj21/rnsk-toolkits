import { tool } from 'ai';
import { z } from 'zod';
import { createComputeClient, getProjectId } from '../client.js';

const DEFAULT_ZONES = [
  'us-central1-a',
  'us-central1-b',
  'us-central1-c',
  'us-east1-a',
  'us-east1-b',
  'us-east1-c',
  'us-west1-a',
  'us-west1-b',
  'us-west1-c',
  'europe-west1-a',
  'europe-west1-b',
  'europe-west1-c',
];

export const gcpListComputeInstances = tool({
  description:
    'List Compute Engine instances in the connected GCP project, optionally filtered by zone. Returns instance name, zone, status, and IPs.',
  inputSchema: z.object({
    gcpCredentials: z.string().optional().describe('Injected by system; do not provide'),
    zone: z.string().optional().describe('Zone to filter by, e.g. "us-central1-a" (default: search common zones)'),
  }),
  execute: async ({ gcpCredentials, zone }) => {
    if (!gcpCredentials) {
      return { error: 'GCP credentials are required. Connect GCP first.' };
    }
    try {
      const client = createComputeClient(gcpCredentials);
      const projectId = getProjectId(gcpCredentials);
      const zones = zone ? [zone] : DEFAULT_ZONES;

      const instances: Record<string, unknown>[] = [];
      for (const z of zones) {
        try {
          const [zoneInstances] = await client.list({ project: projectId, zone: z });
          for (const instance of zoneInstances ?? []) {
            instances.push({
              name: instance.name,
              zone: z,
              status: instance.status,
              machineType: instance.machineType?.split('/').pop(),
              privateIp: instance.networkInterfaces?.[0]?.networkIP,
              publicIp: instance.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP,
              creationTimestamp: instance.creationTimestamp,
            });
          }
        } catch {
          // Zone may not exist or be accessible; skip it.
        }
      }
      return { count: instances.length, instances };
    } catch (err) {
      return {
        error: 'Failed to list Compute Engine instances',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
