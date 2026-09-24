import { tool } from 'ai';
import { z } from 'zod';
import { PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsPutLogEvents = tool({
  description: 'Upload log events to a log stream. Use it to publish data or configure the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the log group'),
    logStreamName: z.string().describe('The name of the log stream'),
    logEvents: z.array(z.record(z.any())).describe('Array of log events with timestamp and message'),
    sequenceToken: z.string().optional().describe('Sequence token from previous put (optional)'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, logStreamName, logEvents, sequenceToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new PutLogEventsCommand({
          logGroupName: logGroupName,
          logStreamName: logStreamName,
          logEvents: logEvents.map((e: any) => ({
              timestamp: e.timestamp,
              message: e.message,
          })),
          sequenceToken: sequenceToken,
      });
      const response = await client.send(command);
      return {
                  success: true,
                  nextSequenceToken: response.nextSequenceToken,
                  rejectedLogEventsInfo: response.rejectedLogEventsInfo,
              };
    } catch (err) {
      return { error: 'Failed to upload log events to a log stream', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
