import { tool } from 'ai';
import { z } from 'zod';
import { DescribePlacementGroupsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2PlacementGroups = tool({
  description: 'Describe placement groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupNames: z.array(z.string()).optional().describe('Array of placement group names'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, groupNames, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribePlacementGroupsCommand({
          GroupNames: groupNames,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { placementGroups: response.PlacementGroups };
    } catch (err) {
      return { error: 'Failed to describe placement groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
