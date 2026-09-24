import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAddonCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDescribeEksAddon = tool({
  description: 'Get details about an addon. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    addonName: z.string().describe('The name of the addon'),
  }),
  execute: async ({ awsCredentials, region, clusterName, addonName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DescribeAddonCommand({
          clusterName: clusterName,
          addonName: addonName,
      });
      const response = await client.send(command);
      return {
                  addon: response.addon,
              };
    } catch (err) {
      return { error: 'Failed to get details about an addon', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
