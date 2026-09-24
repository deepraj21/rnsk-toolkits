import { tool } from 'ai';
import { z } from 'zod';
import { CreateRegexPatternSetCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsCreateRegexPatternSet = tool({
  description: 'Create a regex pattern set for matching strings. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the regex pattern set'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of the regex pattern set'),
    regularExpressionList: z.array(z.record(z.any())).describe('List of regex patterns'),
    description: z.string().optional().describe('Description of the regex pattern set'),
  }),
  execute: async ({ awsCredentials, region, name, scope, regularExpressionList, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new CreateRegexPatternSetCommand({
          Name: name,
          Scope: scope,
          RegularExpressionList: regularExpressionList,
          Description: description,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a regex pattern set for matching strings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
