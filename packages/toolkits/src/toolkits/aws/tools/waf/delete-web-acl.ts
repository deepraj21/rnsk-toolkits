import { tool } from 'ai';
import { z } from 'zod';
import { DeleteWebACLCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsDeleteWebAcl = tool({
  description: 'Delete a Web ACL. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the Web ACL'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of the Web ACL'),
    id: z.string().describe('Unique identifier of the Web ACL'),
    lockToken: z.string().describe('Lock token from Get operation'),
  }),
  execute: async ({ awsCredentials, region, name, scope, id, lockToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new DeleteWebACLCommand({
          Name: name,
          Scope: scope,
          Id: id,
          LockToken: lockToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete a Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
