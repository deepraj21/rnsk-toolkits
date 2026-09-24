import { tool } from 'ai';
import { z } from 'zod';
import { ListNodegroupsCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsListEksNodegroups = tool({
  description: 'List all nodegroups in an EKS cluster. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    maxResults: z.number().optional().describe('Maximum number of nodegroups to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, clusterName, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new ListNodegroupsCommand({
          clusterName: clusterName,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  nodegroups: response.nodegroups || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all nodegroups in an EKS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
