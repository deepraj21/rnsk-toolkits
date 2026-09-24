import { tool } from 'ai';
import { z } from 'zod';
import { ExecutePolicyCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsExecuteAutoscalingPolicy = tool({
  description: 'Execute a scaling policy. Use it to start a query, then poll for results with the query ID.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    policyName: z.string().describe('The name of the policy'),
    honorCooldown: z.boolean().optional().describe('Whether to honor cooldown period'),
    metricValue: z.number().optional().describe('Metric value'),
    breachThreshold: z.number().optional().describe('Breach threshold'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, policyName, honorCooldown, metricValue, breachThreshold }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new ExecutePolicyCommand({
          AutoScalingGroupName: autoScalingGroupName,
          PolicyName: policyName,
          HonorCooldown: honorCooldown,
          MetricValue: metricValue,
          BreachThreshold: breachThreshold,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Policy ${policyName} executed successfully`,
              };
    } catch (err) {
      return { error: 'Failed to execute a scaling policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
