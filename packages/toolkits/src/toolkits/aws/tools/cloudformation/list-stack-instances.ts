import { tool } from 'ai';
import { z } from 'zod';
import { ListStackInstancesCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsListCloudformationStackInstances = tool({
  description: 'List stack instances in a stack set. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackSetName: z.string().describe('Name of the stack set'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, stackSetName, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new ListStackInstancesCommand({
          StackSetName: stackSetName,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return { summaries: response.Summaries, nextToken: response.NextToken };
    } catch (err) {
      return { error: 'Failed to list stack instances in a stack set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
