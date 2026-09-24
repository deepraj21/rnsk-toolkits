import { tool } from 'ai';
import { z } from 'zod';
import { UpdateContainerInstancesStateCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsUpdateEcsContainerInstancesState = tool({
  description: 'Update the state of container instances. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    containerInstances: z.array(z.string()).describe('List of container instance ARNs'),
    status: z.enum(['ACTIVE', 'DRAINING']).describe('New status (ACTIVE, DRAINING)'),
  }),
  execute: async ({ awsCredentials, region, cluster, containerInstances, status }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new UpdateContainerInstancesStateCommand({
          cluster: cluster,
          containerInstances: containerInstances,
          status: status as any,
      });
      const response = await client.send(command);
      return {
                  containerInstances: response.containerInstances || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to update the state of container instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
