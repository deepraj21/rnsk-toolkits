import { tool } from 'ai';
import { z } from 'zod';
import { ListClustersCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsListEksClusters = tool({
  description: 'List all EKS clusters in your AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of clusters to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    include: z.array(z.string()).optional().describe('Additional information to include'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken, include }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new ListClustersCommand({
          maxResults: maxResults,
          nextToken: nextToken,
          include: include as any,
      });
      const response = await client.send(command);
      return {
                  clusters: response.clusters || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all EKS clusters in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
