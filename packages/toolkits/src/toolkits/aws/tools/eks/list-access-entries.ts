import { tool } from 'ai';
import { z } from 'zod';
import { ListAccessEntriesCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsListEksAccessEntries = tool({
  description: 'List all access entries for a cluster. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    maxResults: z.number().optional().describe('Maximum number of entries to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    associatedPolicyArn: z.string().optional().describe('Filter by associated policy ARN'),
  }),
  execute: async ({ awsCredentials, region, clusterName, maxResults, nextToken, associatedPolicyArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new ListAccessEntriesCommand({
          clusterName: clusterName,
          maxResults: maxResults,
          nextToken: nextToken,
          associatedPolicyArn: associatedPolicyArn,
      });
      const response = await client.send(command);
      return {
                  accessEntries: response.accessEntries || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all access entries for a cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
