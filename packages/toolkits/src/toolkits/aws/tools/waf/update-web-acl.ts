import { tool } from 'ai';
import { z } from 'zod';
import { UpdateWebACLCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsUpdateWebAcl = tool({
  description: 'Update an existing Web ACL. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the Web ACL'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of the Web ACL'),
    id: z.string().describe('Unique identifier of the Web ACL'),
    lockToken: z.string().describe('Lock token from Get operation'),
    defaultAction: z.record(z.any()).describe('Updated default action'),
    rules: z.array(z.record(z.any())).optional().describe('Updated rules'),
    visibilityConfig: z.record(z.any()).describe('Updated visibility config'),
  }),
  execute: async ({ awsCredentials, region, name, scope, id, lockToken, defaultAction, rules, visibilityConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new UpdateWebACLCommand({
          Name: name,
          Scope: scope,
          Id: id,
          LockToken: lockToken,
          DefaultAction: defaultAction,
          Rules: rules,
          VisibilityConfig: visibilityConfig,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update an existing Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
