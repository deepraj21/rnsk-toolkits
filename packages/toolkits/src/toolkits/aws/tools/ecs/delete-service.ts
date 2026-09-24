import { tool } from 'ai';
import { z } from 'zod';
import { DeleteServiceCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDeleteEcsService = tool({
  description: 'Delete an ECS service. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    service: z.string().describe('The name of the service to delete'),
    force: z.boolean().optional().describe('Force delete the service'),
  }),
  execute: async ({ awsCredentials, region, cluster, service, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DeleteServiceCommand({
          cluster: cluster,
          service: service,
          force: force,
      });
      const response = await client.send(command);
      return {
                  service: response.service,
              };
    } catch (err) {
      return { error: 'Failed to delete an ECS service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
