import { tool } from 'ai';
import { z } from 'zod';
import { DescribeImagesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2Images = tool({
  description: 'Describe EC2 images (AMIs). Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    imageIds: z.array(z.string()).optional().describe('Array of image IDs'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
    owners: z.array(z.string()).optional().describe('Array of owner IDs'),
  }),
  execute: async ({ awsCredentials, region, imageIds, filters, owners }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeImagesCommand({
          ImageIds: imageIds,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
          Owners: owners,
      });
      const response = await client.send(command);
      return { images: response.Images };
    } catch (err) {
      return { error: 'Failed to describe EC2 images (AMIs)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
