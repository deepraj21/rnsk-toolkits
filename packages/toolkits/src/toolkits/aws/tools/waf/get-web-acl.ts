import { tool } from 'ai';
import { z } from 'zod';
import { GetWebACLCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsGetWebAcl = tool({
  description: 'Get detailed information about a Web ACL. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the Web ACL'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of the Web ACL'),
    id: z.string().describe('Unique identifier of the Web ACL'),
  }),
  execute: async ({ awsCredentials, region, name, scope, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new GetWebACLCommand({
          Name: name,
          Scope: scope,
          Id: id,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about a Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
