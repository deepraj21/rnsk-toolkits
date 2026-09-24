import { tool } from 'ai';
import { z } from 'zod';
import { DescribeClustersCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDescribeEcsClusters = tool({
  description: 'Get details about one or more ECS clusters. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusters: z.array(z.string()).optional().describe('List of cluster names or ARNs to describe'),
    include: z.array(z.string()).optional().describe('Additional information to include (ATTACHMENTS, CONFIGURATIONS, SETTINGS, STATISTICS, TAGS)'),
  }),
  execute: async ({ awsCredentials, region, clusters, include }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DescribeClustersCommand({
          clusters: clusters,
          include: include as any,
      });
      const response = await client.send(command);
      return {
                  clusters: response.clusters || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more ECS clusters', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
