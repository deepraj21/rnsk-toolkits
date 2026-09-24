import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEventAggregatesCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthEventAggregates = tool({
  description: 'Get aggregated counts of events. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filter: z.enum(['issue', 'accountNotification', 'scheduledChange', 'investigation']).optional().describe('Filter criteria for events'),
    aggregateField: z.enum(['eventTypeCategory']).describe('Field to aggregate by'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, filter, aggregateField, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DescribeEventAggregatesCommand({
          filter: filter,
          aggregateField: aggregateField,
          maxResults: maxResults,
          nextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  eventAggregates: response.eventAggregates || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to get aggregated counts of events', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
