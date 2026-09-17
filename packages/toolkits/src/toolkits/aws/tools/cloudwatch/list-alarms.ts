import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAlarmsCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsListCloudwatchAlarms = tool({
  description: 'List CloudWatch alarms, optionally filtered by name prefix or state.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    alarmNamePrefix: z.string().optional().describe('Only return alarms whose name starts with this prefix'),
    stateValue: z.enum(['OK', 'ALARM', 'INSUFFICIENT_DATA']).optional().describe('Only return alarms in this state'),
    maxRecords: z.number().min(1).max(100).optional().describe('Maximum number of alarms to return'),
  }),
  execute: async ({ awsCredentials, region, alarmNamePrefix, stateValue, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);
      const response = await client.send(
        new DescribeAlarmsCommand({
          AlarmNamePrefix: alarmNamePrefix,
          StateValue: stateValue,
          MaxRecords: maxRecords,
        }),
      );
      return {
        alarms: (response.MetricAlarms ?? []).map((alarm) => ({
          alarmName: alarm.AlarmName,
          alarmArn: alarm.AlarmArn,
          stateValue: alarm.StateValue,
          stateReason: alarm.StateReason,
          metricName: alarm.MetricName,
          namespace: alarm.Namespace,
          threshold: alarm.Threshold,
          comparisonOperator: alarm.ComparisonOperator,
        })),
      };
    } catch (err) {
      return {
        error: 'Failed to list CloudWatch alarms',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
