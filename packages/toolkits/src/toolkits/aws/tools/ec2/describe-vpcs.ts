import { tool } from 'ai';
import { z } from 'zod';
import { DescribeVpcsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2Vpcs = tool({
  description: 'Describe VPCs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    vpcIds: z.array(z.string()).optional().describe('Array of VPC IDs'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, vpcIds, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeVpcsCommand({
          VpcIds: vpcIds,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { vpcs: response.Vpcs };
    } catch (err) {
      return { error: 'Failed to describe VPCs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
