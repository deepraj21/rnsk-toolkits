import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTagsCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingTags = tool({
  description: 'Describe tags for Auto Scaling resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filters: z.array(z.record(z.any())).optional().describe('Filters to apply'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, filters, nextToken, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeTagsCommand({
          Filters: filters,
          NextToken: nextToken,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe tags for Auto Scaling resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
