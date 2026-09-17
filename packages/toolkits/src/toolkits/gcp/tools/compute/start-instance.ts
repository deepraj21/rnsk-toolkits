import { tool } from 'ai';
import { z } from 'zod';
import { createComputeClient, getProjectId } from '../client.js';

export const gcpStartComputeInstance = tool({
  description: 'Start a stopped Compute Engine instance.',
  inputSchema: z.object({
    gcpCredentials: z.string().optional().describe('Injected by system; do not provide'),
    instance: z.string().describe('The name of the Compute Engine instance to start'),
    zone: z.string().describe('The zone of the instance, e.g. "us-central1-a"'),
  }),
  execute: async ({ gcpCredentials, instance, zone }) => {
    if (!gcpCredentials) {
      return { error: 'GCP credentials are required. Connect GCP first.' };
    }
    try {
      const client = createComputeClient(gcpCredentials);
      const projectId = getProjectId(gcpCredentials);
      const [operation] = await client.start({ project: projectId, zone, instance });
      return { instance, zone, operation: operation.name, status: 'in_progress' };
    } catch (err) {
      return {
        error: 'Failed to start Compute Engine instance',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
