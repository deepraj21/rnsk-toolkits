import { tool } from 'ai';
import { z } from 'zod';
import { DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2SecurityGroups = tool({
  description: 'Describe EC2 security groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupIds: z.array(z.string()).optional().describe('Array of security group IDs'),
    groupNames: z.array(z.string()).optional().describe('Array of security group names'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, groupIds, groupNames, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeSecurityGroupsCommand({
          GroupIds: groupIds,
          GroupNames: groupNames,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { securityGroups: response.SecurityGroups };
    } catch (err) {
      return { error: 'Failed to describe EC2 security groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
