import { tool } from 'ai';
import { z } from 'zod';
import { ListResourcesForWebACLCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsListResourcesForWebAcl = tool({
  description: 'List all resources associated with a Web ACL. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    webACLArn: z.string().describe('ARN of the Web ACL'),
    resourceType: z.enum(['APPLICATION_LOAD_BALANCER', 'API_GATEWAY', 'APPSYNC', 'COGNITO_USER_POOL']).optional().describe('Filter by resource type'),
  }),
  execute: async ({ awsCredentials, region, webACLArn, resourceType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new ListResourcesForWebACLCommand({
          WebACLArn: webACLArn,
          ResourceType: resourceType,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all resources associated with a Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
