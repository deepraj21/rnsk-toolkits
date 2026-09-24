import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAccessEntryCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDescribeEksAccessEntry = tool({
  description: 'Get details about an access entry. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    principalArn: z.string().describe('The principal ARN'),
  }),
  execute: async ({ awsCredentials, region, clusterName, principalArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DescribeAccessEntryCommand({
          clusterName: clusterName,
          principalArn: principalArn,
      });
      const response = await client.send(command);
      return {
                  accessEntry: response.accessEntry,
              };
    } catch (err) {
      return { error: 'Failed to get details about an access entry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
