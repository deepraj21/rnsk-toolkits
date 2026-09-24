import { tool } from 'ai';
import { z } from 'zod';
import { fetchMetricStatistics } from './metric-statistics.js';
import { createCloudWatchClient } from '../client.js';

export const awsAnalyzeMetric = tool({
  description: 'Analyzes CloudWatch metric data to determine trend, seasonality, and statistical properties. Use it to analyze trends, patterns, and anomalies.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namespace: z.string().describe('The namespace (e.g., AWS/EC2)'),
    metricName: z.string().describe('The metric name'),
    dimensions: z.record(z.any()).optional().describe('Metric dimensions as key-value pairs'),
    startTime: z.string().optional().describe('Start time in ISO 8601 format'),
    endTime: z.string().optional().describe('End time in ISO 8601 format'),
  }),
  execute: async ({ awsCredentials, region, namespace, metricName, dimensions, startTime, endTime }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      // Get metric data for analysis
      const { datapoints } = await fetchMetricStatistics(client, {
      namespace,
      metricName,
      dimensions,
      startTime: startTime || new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
      endTime: endTime || new Date().toISOString(),
    });

      if (datapoints.length === 0) {
          return {
                      trend: 'insufficient_data',
                      seasonality: 'insufficient_data',
                      statistics: {},
                  };
      }

      const values = datapoints.map((d: any) => d.average).filter((v: any) => v != null) as number[];
      const timestamps = datapoints.map((d: any) => new Date(d.timestamp).getTime());

      // Calculate trend (simple linear regression)
      const n = values.length;
      const sumX = timestamps.reduce((a: number, b: number) => a + b, 0);
      const sumY = values.reduce((a: number, b: number) => a + b, 0);
      const sumXY = timestamps.reduce((sum: number, x: number, i: number) => sum + x * values[i], 0);
      const sumXX = timestamps.reduce((sum: number, x: number) => sum + x * x, 0);
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';

      // Basic statistics
      const avg = sumY / n;
      const sorted = [...values].sort((a: number, b: number) => a - b);
      const median = sorted[Math.floor(n / 2)];
      const stdDev = Math.sqrt(values.reduce((sq: number, n: number) => sq + Math.pow(n - avg, 2), 0) / n);

      // Simple seasonality detection (check for patterns in hourly/daily cycles)
      let seasonality = 'none';
      if (n > 24) {
          // Check for daily patterns
          const hourlyAverages: Record<number, number[]> = {};
          datapoints.forEach((d: any) => {
              const hour = new Date(d.timestamp).getHours();
              if (!hourlyAverages[hour]) hourlyAverages[hour] = [];
              hourlyAverages[hour].push(d.average);
          });
          const hourlyVariation = Object.values(hourlyAverages).map(
              (vals) => Math.abs(vals.reduce((a, b) => a + b, 0) / vals.length - avg)
          );
          if (Math.max(...hourlyVariation) > stdDev * 0.5) {
              seasonality = 'daily';
          }
      }

      return {
                  trend,
                  trendSlope: slope,
                  seasonality,
                  statistics: {
                      average: avg,
                      median,
                      standardDeviation: stdDev,
                      minimum: Math.min(...values),
                      maximum: Math.max(...values),
                      dataPoints: n,
                  },
              };
    } catch (err) {
      return { error: 'Failed to analyze CloudWatch metric data', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
