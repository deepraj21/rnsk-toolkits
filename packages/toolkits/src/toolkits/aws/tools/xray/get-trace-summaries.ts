import { tool } from 'ai';
import { z } from 'zod';
import { GetTraceSummariesCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetTraceSummaries = tool({
  description: 'Retrieves IDs and annotations for traces available for a specified time frame using an optional filter. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    startTime: z.string().describe('Start time in ISO 8601 format'),
    endTime: z.string().describe('End time in ISO 8601 format'),
    timeRangeType: z.string().optional().describe('Time range type (TraceId, Event, or Service)'),
    sampling: z.boolean().optional().describe('Set to true to get summaries for sampled requests'),
    filterExpression: z.string().optional().describe('Filter expression to apply'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, startTime, endTime, timeRangeType, sampling, filterExpression, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetTraceSummariesCommand({
          StartTime: new Date(startTime),
          EndTime: new Date(endTime),
          TimeRangeType: timeRangeType as any,
          Sampling: sampling,
          FilterExpression: filterExpression,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  traceSummaries: response.TraceSummaries || [],
                  approximateTime: response.ApproximateTime,
                  tracesProcessedCount: response.TracesProcessedCount,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves IDs and annotations for traces available for a specified time frame using an optional filter', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
