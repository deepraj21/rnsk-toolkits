import { tool } from 'ai';
import { z } from 'zod';
import { DescribePoliciesCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingPolicies = tool({
  description: 'Describe scaling policies. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().optional().describe('The name of the Auto Scaling group'),
    policyNames: z.array(z.string()).optional().describe('Policy names'),
    policyTypes: z.array(z.string()).optional().describe('Policy types'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, policyNames, policyTypes, nextToken, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribePoliciesCommand({
          AutoScalingGroupName: autoScalingGroupName,
          PolicyNames: policyNames,
          PolicyTypes: policyTypes,
          NextToken: nextToken,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return {
                  scalingPolicies: response.ScalingPolicies,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe scaling policies', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
