import { tool } from 'ai';
import { z } from 'zod';
import { DescribeComplianceByResourceCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeComplianceByResource = tool({
  description: 'Indicates whether the specified AWS resources are compliant. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceType: z.string().optional().describe('The type of AWS resource'),
    resourceId: z.string().optional().describe('The ID of the AWS resource'),
    complianceTypes: z.array(z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE', 'INSUFFICIENT_DATA'])).optional().describe('Filter by compliance types'),
    limit: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, resourceType, resourceId, complianceTypes, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeComplianceByResourceCommand({
          ResourceType: resourceType,
          ResourceId: resourceId,
          ComplianceTypes: complianceTypes,
          Limit: limit,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  complianceByResources: response.ComplianceByResources || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to indicates whether the specified AWS resources are compliant', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
