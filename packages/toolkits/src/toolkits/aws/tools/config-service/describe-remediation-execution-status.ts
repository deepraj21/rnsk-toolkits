import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRemediationExecutionStatusCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeRemediationExecutionStatus = tool({
  description: 'Provides a detailed view of a Remediation Execution for a set of resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleName: z.string().describe('The name of the Config rule'),
    resourceKeys: z.array(z.record(z.any())).optional().describe('List of resource keys'),
    limit: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, configRuleName, resourceKeys, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeRemediationExecutionStatusCommand({
          ConfigRuleName: configRuleName,
          ResourceKeys: resourceKeys,
          Limit: limit,
          NextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  remediationExecutionStatuses: response.RemediationExecutionStatuses || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to provides a detailed view of a Remediation Execution for a set of resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
