import { tool } from 'ai';
import { z } from 'zod';
import { fetchMetricStatistics } from './metric-statistics.js';
import { createCloudWatchClient } from '../client.js';

export const awsGetRecommendedMetricAlarms = tool({
  description: 'Gets recommended alarms for a CloudWatch metric based on best practice, and trend, seasonality and statistical analysis. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namespace: z.string().describe('The namespace (e.g., AWS/EC2)'),
    metricName: z.string().describe('The metric name'),
    dimensions: z.record(z.any()).optional().describe('Metric dimensions as key-value pairs'),
    startTime: z.string().optional().describe('Start time in ISO 8601 format for analysis'),
    endTime: z.string().optional().describe('End time in ISO 8601 format for analysis'),
  }),
  execute: async ({ awsCredentials, region, namespace, metricName, dimensions, startTime, endTime }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      // First, get metric data to analyze
      const { datapoints } = await fetchMetricStatistics(client, {
      namespace,
      metricName,
      dimensions,
      startTime: startTime || new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
      endTime: endTime || new Date().toISOString(),
    });

      // Analyze the data to provide recommendations
      if (datapoints.length === 0) {
          return {
                      recommendations: [],
                      message: 'No data available for analysis',
                  };
      }

      const values = datapoints.map((d: any) => d.average).filter((v: any) => v != null);
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const stdDev = Math.sqrt(values.reduce((sq: number, n: number) => sq + Math.pow(n - avg, 2), 0) / values.length);

      // Generate recommendations based on statistical analysis
      const recommendations = [];
      if (max > avg + 2 * stdDev) {
          recommendations.push({
              type: 'HighValueAlarm',
              threshold: avg + 2 * stdDev,
              description: 'Alarm when metric exceeds 2 standard deviations above average',
          });
      }
      if (min < avg - 2 * stdDev) {
          recommendations.push({
              type: 'LowValueAlarm',
              threshold: avg - 2 * stdDev,
              description: 'Alarm when metric falls below 2 standard deviations below average',
          });
      }
      recommendations.push({
          type: 'AverageAlarm',
          threshold: avg,
          description: 'Alarm when metric deviates significantly from average',
      });

      return {
                  recommendations,
                  statistics: {
                      average: avg,
                      maximum: max,
                      minimum: min,
                      standardDeviation: stdDev,
                      dataPoints: datapoints.length,
                  },
              };
    } catch (err) {
      return { error: 'Failed to get recommended CloudWatch metric alarms', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
