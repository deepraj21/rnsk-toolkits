import { tool } from 'ai';
import { z } from 'zod';
import { GetLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsGetLogEvents = tool({
  description: 'Retrieve log events from a log stream. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the log group'),
    logStreamName: z.string().describe('The name of the log stream'),
    startTime: z.number().optional().describe('Start time in Unix timestamp (milliseconds)'),
    endTime: z.number().optional().describe('End time in Unix timestamp (milliseconds)'),
    startFromHead: z.boolean().optional().describe('Start from the beginning if true'),
    limit: z.number().optional().describe('Maximum number of events to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, logStreamName, startTime, endTime, startFromHead, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new GetLogEventsCommand({
          logGroupName: logGroupName,
          logStreamName: logStreamName,
          startTime: startTime,
          endTime: endTime,
          startFromHead: startFromHead,
          limit: limit,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  events: response.events?.map((e: any) => ({
                      timestamp: e.timestamp,
                      message: e.message,
                      ingestionTime: e.ingestionTime,
                  })) || [],
                  nextForwardToken: response.nextForwardToken,
                  nextBackwardToken: response.nextBackwardToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieve log events from a log stream', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
