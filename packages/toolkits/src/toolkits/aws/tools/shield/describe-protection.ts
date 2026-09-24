import { tool } from 'ai';
import { z } from 'zod';
import { DescribeProtectionCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsDescribeProtection = tool({
  description: 'Get details about a specific protection. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    protectionId: z.string().optional().describe('Protection ID'),
    resourceArn: z.string().optional().describe('ARN of the protected resource (alternative to protectionId)'),
  }),
  execute: async ({ awsCredentials, region, protectionId, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new DescribeProtectionCommand({
          ProtectionId: protectionId,
          ResourceArn: resourceArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get details about a specific protection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
