import { tool } from 'ai';
import { z } from 'zod';
import { DeleteNodegroupCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDeleteEksNodegroup = tool({
  description: 'Delete a nodegroup. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    nodegroupName: z.string().describe('The name of the nodegroup to delete'),
  }),
  execute: async ({ awsCredentials, region, clusterName, nodegroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DeleteNodegroupCommand({
          clusterName: clusterName,
          nodegroupName: nodegroupName,
      });
      const response = await client.send(command);
      return {
                  nodegroup: response.nodegroup,
              };
    } catch (err) {
      return { error: 'Failed to delete a nodegroup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
