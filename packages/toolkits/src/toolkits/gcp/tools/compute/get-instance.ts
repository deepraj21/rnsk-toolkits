import { tool } from 'ai';
import { z } from 'zod';
import { createComputeClient, getProjectId } from '../client.js';

export const gcpGetComputeInstance = tool({
  description: 'Get details about a specific Compute Engine instance.',
  inputSchema: z.object({
    gcpCredentials: z.string().optional().describe('Injected by system; do not provide'),
    instance: z.string().describe('The name of the Compute Engine instance'),
    zone: z.string().describe('The zone of the instance, e.g. "us-central1-a"'),
  }),
  execute: async ({ gcpCredentials, instance, zone }) => {
    if (!gcpCredentials) {
      return { error: 'GCP credentials are required. Connect GCP first.' };
    }
    try {
      const client = createComputeClient(gcpCredentials);
      const projectId = getProjectId(gcpCredentials);
      const [instanceData] = await client.get({ project: projectId, zone, instance });
      return {
        name: instanceData.name,
        zone,
        status: instanceData.status,
        machineType: instanceData.machineType?.split('/').pop(),
        privateIp: instanceData.networkInterfaces?.[0]?.networkIP,
        publicIp: instanceData.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP,
        creationTimestamp: instanceData.creationTimestamp,
      };
    } catch (err) {
      return {
        error: 'Failed to get Compute Engine instance',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
