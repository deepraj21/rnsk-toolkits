import { tool } from 'ai';
import { z } from 'zod';
import { GetTrailStatusCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsGetTrailStatus = tool({
  description: 'Returns a JSON-formatted list of information about the specified trail. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name or the Amazon Resource Name (ARN) of the trail'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new GetTrailStatusCommand({
          Name: name,
      });
      const response = await client.send(command);
      return {
                  isLogging: response.IsLogging,
                  latestDeliveryError: response.LatestDeliveryError,
                  latestNotificationError: response.LatestNotificationError,
                  latestCloudWatchLogsDeliveryError: response.LatestCloudWatchLogsDeliveryError,
                  latestCloudWatchLogsDeliveryTime: response.LatestCloudWatchLogsDeliveryTime,
                  latestDeliveryTime: response.LatestDeliveryTime,
                  latestNotificationTime: response.LatestNotificationTime,
                  startLoggingTime: response.StartLoggingTime,
                  stopLoggingTime: response.StopLoggingTime,
                  latestDeliveryAttemptTime: response.LatestDeliveryAttemptTime,
                  latestNotificationAttemptTime: response.LatestNotificationAttemptTime,
                  latestDeliveryAttemptSucceeded: response.LatestDeliveryAttemptSucceeded,
                  latestNotificationAttemptSucceeded: response.LatestNotificationAttemptSucceeded,
                  timeLoggingStarted: response.TimeLoggingStarted,
                  timeLoggingStopped: response.TimeLoggingStopped,
              };
    } catch (err) {
      return { error: 'Failed to returns a JSON-formatted list of information about the specified trail', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
