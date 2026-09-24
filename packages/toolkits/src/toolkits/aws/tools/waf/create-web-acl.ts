import { tool } from 'ai';
import { z } from 'zod';
import { CreateWebACLCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsCreateWebAcl = tool({
  description: 'Create a new Web ACL. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the Web ACL'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope of the Web ACL'),
    defaultAction: z.record(z.any()).describe('Default action (Allow or Block) when no rules match'),
    description: z.string().optional().describe('Description of the Web ACL'),
    rules: z.array(z.record(z.any())).optional().describe('Rules for the Web ACL'),
    visibilityConfig: z.record(z.any()).describe('CloudWatch metrics configuration'),
  }),
  execute: async ({ awsCredentials, region, name, scope, defaultAction, description, rules, visibilityConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new CreateWebACLCommand({
          Name: name,
          Scope: scope,
          DefaultAction: defaultAction,
          Description: description,
          Rules: rules,
          VisibilityConfig: visibilityConfig,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
