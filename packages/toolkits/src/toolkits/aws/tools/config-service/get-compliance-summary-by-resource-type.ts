import { tool } from 'ai';
import { z } from 'zod';
import { GetComplianceSummaryByResourceTypeCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsGetComplianceSummaryByResourceType = tool({
  description: 'Returns the number of compliant and noncompliant rules for one or more resource types. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceTypes: z.array(z.string()).optional().describe('List of resource types'),
  }),
  execute: async ({ awsCredentials, region, resourceTypes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new GetComplianceSummaryByResourceTypeCommand({
          ResourceTypes: resourceTypes,
      });
      const response = await client.send(command);
      return {
                  complianceSummariesByResourceType: response.ComplianceSummariesByResourceType || [],
              };
    } catch (err) {
      return { error: 'Failed to returns the number of compliant and noncompliant rules for one or more resource types', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
