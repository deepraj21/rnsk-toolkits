import { tool } from 'ai';
import { z } from 'zod';
import { GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsGetCloudwatchMetricData = tool({
  description:
    'Retrieve CloudWatch metric statistics for a namespace and metric name (e.g. AWS/EC2 CPUUtilization). Use this to check resource health or usage trends.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namespace: z.string().describe('The metric namespace, e.g. "AWS/EC2"'),
    metricName: z.string().describe('The metric name, e.g. "CPUUtilization"'),
    dimensions: z
      .record(z.string(), z.string())
      .optional()
      .describe('Metric dimensions as key-value pairs, e.g. {"InstanceId": "i-0123456789abcdef0"}'),
    startTime: z.string().optional().describe('Start time in ISO 8601 format (default: 1 hour ago)'),
    endTime: z.string().optional().describe('End time in ISO 8601 format (default: now)'),
    period: z.number().optional().describe('Period in seconds (default: 300)'),
    statistic: z
      .enum(['Average', 'Sum', 'Minimum', 'Maximum', 'SampleCount'])
      .optional()
      .describe('Statistic to retrieve (default: Average)'),
  }),
  execute: async ({ awsCredentials, region, namespace, metricName, dimensions, startTime, endTime, period, statistic }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);
      const response = await client.send(
        new GetMetricStatisticsCommand({
          Namespace: namespace,
          MetricName: metricName,
          Dimensions: dimensions ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })) : undefined,
          StartTime: startTime ? new Date(startTime) : new Date(Date.now() - 3600_000),
          EndTime: endTime ? new Date(endTime) : new Date(),
          Period: period ?? 300,
          Statistics: [statistic ?? 'Average'],
        }),
      );
      return {
        label: response.Label,
        datapoints: (response.Datapoints ?? [])
          .sort((a, b) => (a.Timestamp?.getTime() ?? 0) - (b.Timestamp?.getTime() ?? 0))
          .map((point) => ({
            timestamp: point.Timestamp,
            average: point.Average,
            sum: point.Sum,
            minimum: point.Minimum,
            maximum: point.Maximum,
            sampleCount: point.SampleCount,
            unit: point.Unit,
          })),
      };
    } catch (err) {
      return {
        error: 'Failed to get CloudWatch metric data',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
