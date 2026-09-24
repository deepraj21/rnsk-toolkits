import { tool } from 'ai';
import { z } from 'zod';
import { PutScalingPolicyCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsPutAutoscalingScalingPolicy = tool({
  description: 'Create or update a scaling policy. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    policyName: z.string().describe('The name of the policy'),
    policyType: z.string().optional().describe('Policy type'),
    adjustmentType: z.string().optional().describe('Adjustment type'),
    minAdjustmentStep: z.number().optional().describe('Minimum adjustment step'),
    minAdjustmentMagnitude: z.number().optional().describe('Minimum adjustment magnitude'),
    scalingAdjustment: z.number().optional().describe('Scaling adjustment'),
    cooldown: z.number().optional().describe('Cooldown period'),
    metricAggregationType: z.string().optional().describe('Metric aggregation type'),
    stepAdjustments: z.array(z.record(z.any())).optional().describe('Step adjustments'),
    estimatedInstanceWarmup: z.number().optional().describe('Estimated instance warmup'),
    targetTrackingConfiguration: z.record(z.any()).optional().describe('Target tracking configuration'),
    enabled: z.boolean().optional().describe('Whether the policy is enabled'),
    predictiveScalingConfiguration: z.record(z.any()).optional().describe('Predictive scaling configuration'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, policyName, policyType, adjustmentType, minAdjustmentStep, minAdjustmentMagnitude, scalingAdjustment, cooldown, metricAggregationType, stepAdjustments, estimatedInstanceWarmup, targetTrackingConfiguration, enabled, predictiveScalingConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new PutScalingPolicyCommand({
          AutoScalingGroupName: autoScalingGroupName,
          PolicyName: policyName,
          PolicyType: policyType,
          AdjustmentType: adjustmentType,
          MinAdjustmentStep: minAdjustmentStep,
          MinAdjustmentMagnitude: minAdjustmentMagnitude,
          ScalingAdjustment: scalingAdjustment,
          Cooldown: cooldown,
          MetricAggregationType: metricAggregationType,
          StepAdjustments: stepAdjustments,
          EstimatedInstanceWarmup: estimatedInstanceWarmup,
          TargetTrackingConfiguration: targetTrackingConfiguration,
          Enabled: enabled,
          PredictiveScalingConfiguration: predictiveScalingConfiguration,
      } as any);
      const response = await client.send(command);
      return {
                  policyARN: response.PolicyARN,
                  alarms: response.Alarms,
              };
    } catch (err) {
      return { error: 'Failed to create or update a scaling policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
