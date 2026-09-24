import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateWebACLCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsDisassociateWebAcl = tool({
  description: 'Disassociate a Web ACL from a resource. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the resource'),
  }),
  execute: async ({ awsCredentials, region, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new DisassociateWebACLCommand({
          ResourceArn: resourceArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to disassociate a Web ACL from a resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
