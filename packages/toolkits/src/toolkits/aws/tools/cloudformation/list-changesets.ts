import { tool } from 'ai';
import { z } from 'zod';
import { ListChangeSetsCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsListCloudformationChangesets = tool({
  description: 'List change sets for a CloudFormation stack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, stackName, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new ListChangeSetsCommand({
          StackName: stackName,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return { summaries: response.Summaries, nextToken: response.NextToken };
    } catch (err) {
      return { error: 'Failed to list change sets for a CloudFormation stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
