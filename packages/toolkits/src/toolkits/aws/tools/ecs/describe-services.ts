import { tool } from 'ai';
import { z } from 'zod';
import { DescribeServicesCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDescribeEcsServices = tool({
  description: 'Get details about one or more ECS services. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    services: z.array(z.string()).describe('List of service names or ARNs to describe'),
    include: z.array(z.string()).optional().describe('Additional information to include (TAGS)'),
  }),
  execute: async ({ awsCredentials, region, cluster, services, include }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DescribeServicesCommand({
          cluster: cluster,
          services: services,
          include: include as any,
      });
      const response = await client.send(command);
      return {
                  services: response.services || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more ECS services', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
