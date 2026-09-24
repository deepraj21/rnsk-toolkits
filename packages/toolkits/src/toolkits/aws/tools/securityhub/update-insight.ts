import { tool } from 'ai';
import { z } from 'zod';
import { UpdateInsightCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsUpdateInsight = tool({
  description: 'Update an existing custom insight. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    insightArn: z.string().describe('ARN of the insight to update'),
    name: z.string().optional().describe('New name for the insight'),
    filters: z.record(z.any()).optional().describe('New filters for the insight'),
    groupByAttribute: z.string().optional().describe('New grouping attribute'),
  }),
  execute: async ({ awsCredentials, region, insightArn, name, filters, groupByAttribute }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new UpdateInsightCommand({
          InsightArn: insightArn,
          Name: name,
          Filters: filters,
          GroupByAttribute: groupByAttribute,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update an existing custom insight', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
