import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAlarmHistoryCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsGetAlarmHistory = tool({
  description: 'Retrieves historical state changes and patterns for a given CloudWatch alarm. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    alarmName: z.string().describe('The name of the CloudWatch alarm'),
    startDate: z.string().optional().describe('Start date in ISO 8601 format'),
    endDate: z.string().optional().describe('End date in ISO 8601 format'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, alarmName, startDate, endDate, maxRecords, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      const command = new DescribeAlarmHistoryCommand({
          AlarmName: alarmName,
          StartDate: startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 3600000),
          EndDate: endDate ? new Date(endDate) : new Date(),
          MaxRecords: maxRecords || 100,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  alarmHistoryItems: response.AlarmHistoryItems?.map((h: any) => ({
                      alarmName: h.AlarmName,
                      timestamp: h.Timestamp,
                      historyItemType: h.HistoryItemType,
                      historySummary: h.HistorySummary,
                      historyData: h.HistoryData,
                  })) || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieve CloudWatch alarm history', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
