import { tool } from 'ai';
import { z } from 'zod';
import { PutMetricAlarmCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsPutMetricAlarm = tool({
  description: 'Create or update a CloudWatch metric alarm. Use it to publish data or configure the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    alarmName: z.string().describe('The name of the alarm'),
    alarmDescription: z.string().optional().describe('Description of the alarm'),
    metricName: z.string().describe('The metric name'),
    namespace: z.string().describe('The namespace'),
    statistic: z.string().describe('Statistic (Average, Sum, Minimum, Maximum, SampleCount)'),
    period: z.number().describe('Period in seconds'),
    evaluationPeriods: z.number().describe('Number of evaluation periods'),
    threshold: z.number().describe('Alarm threshold value'),
    comparisonOperator: z.string().describe('Comparison operator (GreaterThanThreshold, LessThanThreshold, etc.)'),
    dimensions: z.array(z.record(z.any())).optional().describe('Array of dimension objects'),
    actionsEnabled: z.boolean().optional().describe('Whether actions should be executed'),
    alarmActions: z.array(z.string()).optional().describe('Array of ARNs for alarm actions'),
    okActions: z.array(z.string()).optional().describe('Array of ARNs for OK actions'),
    insufficientDataActions: z.array(z.string()).optional().describe('Array of ARNs for insufficient data actions'),
    extendedStatistic: z.string().optional().describe('Extended statistic for the alarm (e.g. p99). Use instead of statistic for percentile alarms.'),
    datapointsToAlarm: z.number().optional().describe('Number of datapoints within the evaluation periods that must breach the threshold to alarm.'),
    thresholdMetricId: z.string().optional().describe('Metric ID used as the threshold for anomaly detection alarms.'),
    metrics: z.array(z.record(z.any())).optional().describe('Metric math expressions for composite or anomaly-detection alarms.'),
    treatMissingData: z.string().optional().describe('How to treat missing data (missing, ignore, breaching, notBreaching).'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to attach to the alarm.'),
    unit: z.string().optional().describe('Unit filter for the metric (e.g. Seconds, Bytes).'),
    evaluateLowSampleCountPercentile: z.string().optional().describe('Behavior for low sample counts (evaluate or ignore).'),
  }),
  execute: async ({ awsCredentials, region, alarmName, alarmDescription, metricName, namespace, statistic, period, evaluationPeriods, threshold, comparisonOperator, dimensions, actionsEnabled, alarmActions, okActions, insufficientDataActions, extendedStatistic, datapointsToAlarm, thresholdMetricId, metrics, treatMissingData, tags, unit, evaluateLowSampleCountPercentile }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      const command = new PutMetricAlarmCommand({
          AlarmName: alarmName,
          AlarmDescription: alarmDescription,
          MetricName: metricName,
          Namespace: namespace,
          Statistic: statistic,
          ExtendedStatistic: extendedStatistic,
          Dimensions: dimensions,
          Period: period,
          Unit: unit,
          EvaluationPeriods: evaluationPeriods,
          DatapointsToAlarm: datapointsToAlarm,
          Threshold: threshold,
          ComparisonOperator: comparisonOperator as any,
          TreatMissingData: treatMissingData,
          EvaluateLowSampleCountPercentile: evaluateLowSampleCountPercentile,
          ActionsEnabled: actionsEnabled,
          AlarmActions: alarmActions,
          OKActions: okActions,
          InsufficientDataActions: insufficientDataActions,
          Metrics: metrics,
          Tags: tags,
          ThresholdMetricId: thresholdMetricId,
      } as any);
      await client.send(command);
      return {
                  success: true,
                  message: `Alarm ${alarmName} created/updated successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create or update a CloudWatch metric alarm', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
