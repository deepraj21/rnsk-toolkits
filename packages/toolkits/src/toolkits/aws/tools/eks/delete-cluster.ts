import { tool } from 'ai';
import { z } from 'zod';
import { DeleteClusterCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDeleteEksCluster = tool({
  description: 'Delete an EKS cluster. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the cluster to delete'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DeleteClusterCommand({
          name: name,
      });
      const response = await client.send(command);
      return {
                  cluster: response.cluster,
              };
    } catch (err) {
      return { error: 'Failed to delete an EKS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
