import { tool } from 'ai';
import { z } from 'zod';
import { DescribeInstanceTypesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2InstanceTypes = tool({
  description: 'Describe EC2 instance types. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceTypes: z.array(z.string()).optional().describe('Array of instance types'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, instanceTypes, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeInstanceTypesCommand({
          InstanceTypes: instanceTypes as any,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { instanceTypes: response.InstanceTypes };
    } catch (err) {
      return { error: 'Failed to describe EC2 instance types', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
