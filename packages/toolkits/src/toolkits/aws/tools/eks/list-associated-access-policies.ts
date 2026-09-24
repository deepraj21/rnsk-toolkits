import { tool } from 'ai';
import { z } from 'zod';
import { ListAssociatedAccessPoliciesCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsListEksAssociatedAccessPolicies = tool({
  description: 'List access policies associated with an access entry. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    principalArn: z.string().describe('The principal ARN'),
    maxResults: z.number().optional().describe('Maximum number of policies to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, clusterName, principalArn, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new ListAssociatedAccessPoliciesCommand({
          clusterName: clusterName,
          principalArn: principalArn,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  associatedAccessPolicies: response.associatedAccessPolicies || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list access policies associated with an access entry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
