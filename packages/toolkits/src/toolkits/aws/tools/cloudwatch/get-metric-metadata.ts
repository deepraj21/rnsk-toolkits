import { tool } from 'ai';
import { z } from 'zod';
import { ListMetricsCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsGetMetricMetadata = tool({
  description: 'Retrieves comprehensive metadata about a specific CloudWatch metric. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namespace: z.string().describe('The namespace (e.g., AWS/EC2)'),
    metricName: z.string().describe('The metric name'),
    dimensions: z.record(z.any()).optional().describe('Metric dimensions as key-value pairs'),
    recentlyActive: z.string().optional().describe('Filter by recently active (PT3H for last 3 hours)'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, namespace, metricName, dimensions, recentlyActive, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      const command = new ListMetricsCommand({
          Namespace: namespace,
          MetricName: metricName,
          Dimensions: dimensions ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })) : undefined,
          RecentlyActive: recentlyActive as any,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  metrics: response.Metrics?.map((m: any) => ({
                      namespace: m.Namespace,
                      metricName: m.MetricName,
                      dimensions: m.Dimensions?.map((d: any) => ({
                          name: d.Name,
                          value: d.Value,
                      })) || [],
                  })) || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieve CloudWatch metric metadata', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
