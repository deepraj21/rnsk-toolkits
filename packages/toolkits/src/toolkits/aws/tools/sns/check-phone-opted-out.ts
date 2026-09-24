import { tool } from 'ai';
import { z } from 'zod';
import { CheckIfPhoneNumberIsOptedOutCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsCheckSnsPhoneOptedOut = tool({
  description: 'Check if a phone number is opted out of SMS. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    phoneNumber: z.string().describe('The phone number to check'),
  }),
  execute: async ({ awsCredentials, region, phoneNumber }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new CheckIfPhoneNumberIsOptedOutCommand({
          phoneNumber: phoneNumber,
      });
      const response = await client.send(command);
      return {
                  isOptedOut: response.isOptedOut,
              };
    } catch (err) {
      return { error: 'Failed to check if a phone number is opted out of SMS', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
