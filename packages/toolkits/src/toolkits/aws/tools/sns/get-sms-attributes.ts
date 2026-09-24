import { tool } from 'ai';
import { z } from 'zod';
import { GetSMSAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsGetSnsSmsAttributes = tool({
  description: 'Get SMS attributes for the account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new GetSMSAttributesCommand({});
      const response = await client.send(command);
      return {
                  attributes: response.attributes || {},
              };
    } catch (err) {
      return { error: 'Failed to get SMS attributes for the account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
