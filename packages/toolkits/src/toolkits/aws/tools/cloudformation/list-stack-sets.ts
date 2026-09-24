import { tool } from 'ai';
import { z } from 'zod';
import { ListStackSetsCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsListCloudformationStackSets = tool({
  description: 'List all CloudFormation stack sets. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new ListStackSetsCommand({
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return { summaries: response.Summaries, nextToken: response.NextToken };
    } catch (err) {
      return { error: 'Failed to list all CloudFormation stack sets', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
