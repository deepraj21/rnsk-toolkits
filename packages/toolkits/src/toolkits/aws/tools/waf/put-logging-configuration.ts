import { tool } from 'ai';
import { z } from 'zod';
import { PutLoggingConfigurationCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsPutLoggingConfiguration = tool({
  description: 'Configure logging for a Web ACL. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    loggingConfiguration: z.record(z.any()).describe('Logging configuration'),
  }),
  execute: async ({ awsCredentials, region, loggingConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new PutLoggingConfigurationCommand({
          LoggingConfiguration: loggingConfiguration,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to configure logging for a Web ACL', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
