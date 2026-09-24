import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTagsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2Tags = tool({
  description: 'Describe tags for EC2 resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeTagsCommand({
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { tags: response.Tags };
    } catch (err) {
      return { error: 'Failed to describe tags for EC2 resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
