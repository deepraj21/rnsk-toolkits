import { tool } from 'ai';
import { z } from 'zod';
import { FilterLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsFilterCloudwatchLogEvents = tool({
  description:
    'Search log events in a CloudWatch log group using an optional filter pattern and time range. Useful for finding errors or specific messages in logs.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the CloudWatch log group to search'),
    filterPattern: z.string().optional().describe('Filter pattern, e.g. "ERROR" or "?ERROR ?Exception"'),
    startTime: z.number().optional().describe('Start time as a Unix timestamp in milliseconds'),
    endTime: z.number().optional().describe('End time as a Unix timestamp in milliseconds'),
    limit: z.number().min(1).max(200).optional().describe('Maximum number of log events to return (default 50)'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, filterPattern, startTime, endTime, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);
      const response = await client.send(
        new FilterLogEventsCommand({
          logGroupName,
          filterPattern,
          startTime,
          endTime,
          limit: limit ?? 50,
        }),
      );
      return {
        events: (response.events ?? []).map((event) => ({
          logStreamName: event.logStreamName,
          timestamp: event.timestamp,
          message: event.message,
        })),
      };
    } catch (err) {
      return {
        error: 'Failed to filter CloudWatch log events',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
