import { tool } from 'ai';
import { z } from 'zod';
import { GetLoggingConfigurationCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsGetLoggingConfiguration = tool({
  description: 'Get logging configuration for a Web ACL. Use it to inspect current state before making changes.',
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

      const command = new GetLoggingConfigurationCommand({
          ResourceArn: resourceArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get logging configuration for a Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
