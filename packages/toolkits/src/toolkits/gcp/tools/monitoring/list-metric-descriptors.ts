import { tool } from 'ai';
import { z } from 'zod';
import { createMonitoringClient, getProjectId } from '../client.js';

export const gcpListMonitoringMetricDescriptors = tool({
  description: 'List available Cloud Monitoring metric descriptors, optionally filtered by metric type.',
  inputSchema: z.object({
    gcpCredentials: z.string().optional().describe('Injected by system; do not provide'),
    filter: z.string().optional().describe('Optional filter for metric type, e.g. \'metric.type = starts_with("compute")\''),
  }),
  execute: async ({ gcpCredentials, filter }) => {
    if (!gcpCredentials) {
      return { error: 'GCP credentials are required. Connect GCP first.' };
    }
    try {
      const client = createMonitoringClient(gcpCredentials);
      const projectId = getProjectId(gcpCredentials);
      const [descriptors] = await client.listMetricDescriptors({
        name: `projects/${projectId}`,
        filter,
      });
      return {
        descriptors: (descriptors ?? []).map((descriptor) => ({
          type: descriptor.type,
          displayName: descriptor.displayName,
          description: descriptor.description,
          metricKind: descriptor.metricKind,
          valueType: descriptor.valueType,
          unit: descriptor.unit,
        })),
      };
    } catch (err) {
      return {
        error: 'Failed to list Cloud Monitoring metric descriptors',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
