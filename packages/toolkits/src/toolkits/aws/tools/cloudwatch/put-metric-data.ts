import { tool } from 'ai';
import { z } from 'zod';
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsPutMetricData = tool({
  description: 'Publish custom metric data points to CloudWatch. Use it to publish data or configure the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namespace: z.string().describe('The namespace for the metric data'),
    metricData: z.array(z.record(z.any())).describe('Array of metric data points with MetricName, Dimensions, Timestamp, Value, Unit, etc.'),
  }),
  execute: async ({ awsCredentials, region, namespace, metricData }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      const command = new PutMetricDataCommand({
          Namespace: namespace,
          MetricData: metricData.map((m: any) => ({
              MetricName: m.MetricName,
              Dimensions: m.Dimensions?.map((d: any) => ({
                  Name: d.Name || d.name,
                  Value: d.Value || d.value,
              })),
              Timestamp: m.Timestamp ? new Date(m.Timestamp) : undefined,
              Value: m.Value,
              Unit: m.Unit,
              StatisticValues: m.StatisticValues,
              Values: m.Values,
              Counts: m.Counts,
          })),
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Metric data published successfully to namespace ${namespace}`,
              };
    } catch (err) {
      return { error: 'Failed to publish custom metric data points to CloudWatch', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
