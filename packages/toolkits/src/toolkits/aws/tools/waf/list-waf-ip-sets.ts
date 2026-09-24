import { tool } from 'ai';
import { z } from 'zod';
import { ListIPSetsCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsListWafIpSets = tool({
  description: 'List all IP sets. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of IP sets'),
    limit: z.number().optional().describe('Maximum number of IP sets to return'),
    nextMarker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, scope, limit, nextMarker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new ListIPSetsCommand({
          Scope: scope,
          Limit: limit,
          NextMarker: nextMarker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all IP sets', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
