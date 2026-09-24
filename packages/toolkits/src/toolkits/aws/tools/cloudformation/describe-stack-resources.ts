import { tool } from 'ai';
import { z } from 'zod';
import { DescribeStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDescribeCloudformationStackResources = tool({
  description: 'Describe all resources in a CloudFormation stack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    logicalResourceId: z.string().optional().describe('Logical ID to filter by'),
    physicalResourceId: z.string().optional().describe('Physical ID to filter by'),
  }),
  execute: async ({ awsCredentials, region, stackName, logicalResourceId, physicalResourceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DescribeStackResourcesCommand({
          StackName: stackName,
          LogicalResourceId: logicalResourceId,
          PhysicalResourceId: physicalResourceId,
      });
      const response = await client.send(command);
      return { stackResources: response.StackResources };
    } catch (err) {
      return { error: 'Failed to describe all resources in a CloudFormation stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
