import { tool } from 'ai';
import { z } from 'zod';
import { ListClustersCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsClusters = tool({
  description: 'List all ECS clusters in your AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of clusters to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new ListClustersCommand({
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  clusterArns: response.clusterArns || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all ECS clusters in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
