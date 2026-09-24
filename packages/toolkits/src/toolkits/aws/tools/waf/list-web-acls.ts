import { tool } from 'ai';
import { z } from 'zod';
import { ListWebACLsCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsListWebAcls = tool({
  description: 'List all Web ACLs in the region or CloudFront. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of Web ACLs (REGIONAL for ALB/API Gateway, CLOUDFRONT for CloudFront)'),
    limit: z.number().optional().describe('Maximum number of Web ACLs to return (1-100)'),
    nextMarker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, scope, limit, nextMarker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new ListWebACLsCommand({
          Scope: scope,
          Limit: limit,
          NextMarker: nextMarker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all Web ACLs in the region or CloudFront', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
