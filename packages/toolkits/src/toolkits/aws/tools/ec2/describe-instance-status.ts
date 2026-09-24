import { tool } from 'ai';
import { z } from 'zod';
import { DescribeInstanceStatusCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2InstanceStatus = tool({
  description: 'Describe the status of EC2 instances. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceIds: z.array(z.string()).optional().describe('Array of instance IDs'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, instanceIds, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeInstanceStatusCommand({
          InstanceIds: instanceIds,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { instanceStatuses: response.InstanceStatuses };
    } catch (err) {
      return { error: 'Failed to describe the status of EC2 instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
