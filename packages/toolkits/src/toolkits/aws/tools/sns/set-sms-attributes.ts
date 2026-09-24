import { tool } from 'ai';
import { z } from 'zod';
import { SetSMSAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsSetSnsSmsAttributes = tool({
  description: 'Set SMS attributes for the account. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    attributes: z.record(z.any()).describe('SMS attributes to set'),
  }),
  execute: async ({ awsCredentials, region, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new SetSMSAttributesCommand({
          attributes: attributes,
      });
      await client.send(command);
      return {
                  success: true,
                  message: 'SMS attributes set successfully',
              };
    } catch (err) {
      return { error: 'Failed to set SMS attributes for the account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
