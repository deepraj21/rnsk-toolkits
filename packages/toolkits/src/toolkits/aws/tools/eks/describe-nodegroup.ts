import { tool } from 'ai';
import { z } from 'zod';
import { DescribeNodegroupCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDescribeEksNodegroup = tool({
  description: 'Get details about a nodegroup. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    nodegroupName: z.string().describe('The name of the nodegroup'),
  }),
  execute: async ({ awsCredentials, region, clusterName, nodegroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DescribeNodegroupCommand({
          clusterName: clusterName,
          nodegroupName: nodegroupName,
      });
      const response = await client.send(command);
      return {
                  nodegroup: response.nodegroup,
              };
    } catch (err) {
      return { error: 'Failed to get details about a nodegroup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
