import { tool } from 'ai';
import { z } from 'zod';
import { GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsGetCloudwatchMetrics = tool({
  description: 'Retrieve CloudWatch metrics. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namespace: z.string().describe('The namespace (e.g., AWS/EC2)'),
    metricName: z.string().describe('The metric name'),
    dimensions: z.record(z.any()).optional().describe('Metric dimensions as key-value pairs'),
    startTime: z.string().optional().describe('Start time in ISO 8601 format'),
    endTime: z.string().optional().describe('End time in ISO 8601 format'),
    period: z.number().optional().describe('Period in seconds'),
    statistics: z.array(z.string()).optional().describe('Statistics (Average, Maximum, Minimum, Sum, SampleCount)'),
  }),
  execute: async ({ awsCredentials, region, namespace, metricName, dimensions, startTime, endTime, period, statistics }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      const command = new GetMetricStatisticsCommand({
          Namespace: namespace,
          MetricName: metricName,
          Dimensions: dimensions ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })) : undefined,
          StartTime: startTime ? new Date(startTime) : new Date(Date.now() - 3600000),
          EndTime: endTime ? new Date(endTime) : new Date(),
          Period: period || 3600,
          Statistics: (statistics || ['Average', 'Maximum', 'Minimum']) as any[],
      });
      const response = await client.send(command);
      return {
                  label: response.Label,
                  datapoints: response.Datapoints?.map((d: any) => ({
                      timestamp: d.Timestamp,
                      average: d.Average,
                      maximum: d.Maximum,
                      minimum: d.Minimum,
                      sum: d.Sum,
                      sampleCount: d.SampleCount,
                      unit: d.Unit,
                  })) || [],
              };
    } catch (err) {
      return { error: 'Failed to retrieve CloudWatch metrics', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
