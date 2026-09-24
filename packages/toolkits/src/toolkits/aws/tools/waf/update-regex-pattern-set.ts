import { tool } from 'ai';
import { z } from 'zod';
import { UpdateRegexPatternSetCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsUpdateRegexPatternSet = tool({
  description: 'Update a regex pattern set. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the regex pattern set'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope'),
    id: z.string().describe('Unique identifier'),
    lockToken: z.string().describe('Lock token from Get operation'),
    regularExpressionList: z.array(z.record(z.any())).describe('Updated regex patterns'),
  }),
  execute: async ({ awsCredentials, region, name, scope, id, lockToken, regularExpressionList }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new UpdateRegexPatternSetCommand({
          Name: name,
          Scope: scope,
          Id: id,
          LockToken: lockToken,
          RegularExpressionList: regularExpressionList,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update a regex pattern set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
