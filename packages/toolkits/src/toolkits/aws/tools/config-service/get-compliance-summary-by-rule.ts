import { tool } from 'ai';
import { z } from 'zod';
import { GetComplianceSummaryByConfigRuleCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsGetComplianceSummaryByConfigRule = tool({
  description: 'Returns compliance summary for the specified Config rule. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new GetComplianceSummaryByConfigRuleCommand({});
      const response = await client.send(command);
      return {
                  complianceSummary: response.ComplianceSummary,
              };
    } catch (err) {
      return { error: 'Failed to returns compliance summary for the specified Config rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
