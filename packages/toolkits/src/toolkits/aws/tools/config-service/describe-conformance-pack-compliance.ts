import { tool } from 'ai';
import { z } from 'zod';
import { DescribeConformancePackComplianceCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeConformancePackCompliance = tool({
  description: 'Returns compliance details of a conformance pack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    conformancePackName: z.string().describe('The name of the conformance pack'),
    filters: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'INSUFFICIENT_DATA', 'NOT_APPLICABLE']).optional().describe('Filter criteria'),
    limit: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, conformancePackName, filters, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeConformancePackComplianceCommand({
          ConformancePackName: conformancePackName,
          Filters: filters,
          Limit: limit,
          NextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  conformancePackName: response.ConformancePackName,
                  conformancePackRuleComplianceList: response.ConformancePackRuleComplianceList || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns compliance details of a conformance pack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
