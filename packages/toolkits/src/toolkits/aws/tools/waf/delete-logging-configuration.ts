import { tool } from 'ai';
import { z } from 'zod';
import { DeleteLoggingConfigurationCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsDeleteLoggingConfiguration = tool({
  description: 'Delete logging configuration for a Web ACL. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the Web ACL'),
  }),
  execute: async ({ awsCredentials, region, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new DeleteLoggingConfigurationCommand({
          ResourceArn: resourceArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete logging configuration for a Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
