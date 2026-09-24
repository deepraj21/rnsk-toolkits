import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAccountLimitsCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingAccountLimits = tool({
  description: 'Describe account limits for Auto Scaling. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeAccountLimitsCommand({});
      const response = await client.send(command);
      return {
                  maxNumberOfAutoScalingGroups: response.MaxNumberOfAutoScalingGroups,
                  maxNumberOfLaunchConfigurations: response.MaxNumberOfLaunchConfigurations,
                  numberOfAutoScalingGroups: response.NumberOfAutoScalingGroups,
                  numberOfLaunchConfigurations: response.NumberOfLaunchConfigurations,
              };
    } catch (err) {
      return { error: 'Failed to describe account limits for Auto Scaling', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
