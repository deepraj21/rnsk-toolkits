import { tool } from 'ai';
import { z } from 'zod';
import { GetReusableDelegationSetLimitCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53ReusableDelegationSetLimit = tool({
  description: 'Get the limit for a specific reusable delegation set setting. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    type: z.string().describe('Limit type (e.g. MAX_VPCS_ASSOCIATED_BY_DELEGATION_SET)'),
    delegationSetId: z.string().describe('The delegation set ID'),
  }),
  execute: async ({ awsCredentials, region, delegationSetId, type }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new GetReusableDelegationSetLimitCommand({
          Type: type as any,
          DelegationSetId: delegationSetId,
      });
      const response = await client.send(command);
      return {
                  limit: response.Limit,
                  count: response.Count,
              };
    } catch (err) {
      return { error: 'Failed to get the limit for a specific reusable delegation set setting', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
