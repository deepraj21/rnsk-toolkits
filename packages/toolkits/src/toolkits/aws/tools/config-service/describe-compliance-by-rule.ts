import { tool } from 'ai';
import { z } from 'zod';
import { DescribeComplianceByConfigRuleCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeComplianceByConfigRule = tool({
  description: 'Indicates whether the specified Config rules are compliant. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleNames: z.array(z.string()).optional().describe('List of Config rule names'),
    complianceTypes: z.array(z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE', 'INSUFFICIENT_DATA'])).optional().describe('Filter by compliance types'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, configRuleNames, complianceTypes, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeComplianceByConfigRuleCommand({
          ConfigRuleNames: configRuleNames,
          ComplianceTypes: complianceTypes,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  complianceByConfigRules: response.ComplianceByConfigRules || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to indicates whether the specified Config rules are compliant', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
