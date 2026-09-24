import { tool } from 'ai';
import { z } from 'zod';
import { DescribeChangeSetCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDescribeCloudformationChangeset = tool({
  description: 'Describe a CloudFormation change set. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    changeSetName: z.string().describe('Name of the change set'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, stackName, changeSetName, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DescribeChangeSetCommand({
          StackName: stackName,
          ChangeSetName: changeSetName,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return { changeSet: response };
    } catch (err) {
      return { error: 'Failed to describe a CloudFormation change set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
