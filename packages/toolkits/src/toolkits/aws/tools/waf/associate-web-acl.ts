import { tool } from 'ai';
import { z } from 'zod';
import { AssociateWebACLCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsAssociateWebAcl = tool({
  description: 'Associate a Web ACL with a resource (ALB, API Gateway, CloudFront). Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    webACLArn: z.string().describe('ARN of the Web ACL'),
    resourceArn: z.string().describe('ARN of the resource (ALB, API Gateway, etc.)'),
  }),
  execute: async ({ awsCredentials, region, webACLArn, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new AssociateWebACLCommand({
          WebACLArn: webACLArn,
          ResourceArn: resourceArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to associate a Web ACL with a resource (ALB, API Gateway, CloudFront)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
