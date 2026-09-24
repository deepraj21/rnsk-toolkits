import { tool } from 'ai';
import { z } from 'zod';
import { DescribeLogStreamsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsDescribeLogStreams = tool({
  description: 'List log streams in a log group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the log group'),
    logStreamNamePrefix: z.string().optional().describe('Optional prefix to filter stream names'),
    orderBy: z.string().optional().describe('Order by LogStreamName or LastEventTime'),
    descending: z.boolean().optional().describe('Order in descending order'),
    limit: z.number().optional().describe('Maximum number of streams to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, logStreamNamePrefix, orderBy, descending, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new DescribeLogStreamsCommand({
          logGroupName: logGroupName,
          logStreamNamePrefix: logStreamNamePrefix,
          orderBy: orderBy as any,
          descending: descending,
          limit: limit,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  logStreams: response.logStreams?.map((ls: any) => ({
                      logStreamName: ls.logStreamName,
                      creationTime: ls.creationTime,
                      firstEventTimestamp: ls.firstEventTimestamp,
                      lastEventTimestamp: ls.lastEventTimestamp,
                      lastIngestionTime: ls.lastIngestionTime,
                      uploadSequenceToken: ls.uploadSequenceToken,
                      arn: ls.arn,
                      storedBytes: ls.storedBytes,
                  })) || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list log streams in a log group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
