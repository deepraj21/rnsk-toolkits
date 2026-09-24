import { tool } from 'ai';
import { z } from 'zod';
import { DeleteClusterCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDeleteEcsCluster = tool({
  description: 'Delete an ECS cluster. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster to delete'),
  }),
  execute: async ({ awsCredentials, region, cluster }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DeleteClusterCommand({
          cluster: cluster,
      });
      const response = await client.send(command);
      return {
                  cluster: response.cluster,
              };
    } catch (err) {
      return { error: 'Failed to delete an ECS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
