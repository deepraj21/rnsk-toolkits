import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAddonCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDeleteEksAddon = tool({
  description: 'Delete an addon. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    addonName: z.string().describe('The name of the addon to delete'),
    preserve: z.boolean().optional().describe('Preserve addon resources'),
  }),
  execute: async ({ awsCredentials, region, clusterName, addonName, preserve }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DeleteAddonCommand({
          clusterName: clusterName,
          addonName: addonName,
          preserve: preserve,
      });
      const response = await client.send(command);
      return {
                  addon: response.addon,
              };
    } catch (err) {
      return { error: 'Failed to delete an addon', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
