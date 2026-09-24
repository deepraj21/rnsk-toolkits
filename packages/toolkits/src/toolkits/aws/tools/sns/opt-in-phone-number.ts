import { tool } from 'ai';
import { z } from 'zod';
import { OptInPhoneNumberCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsOptInSnsPhoneNumber = tool({
  description: 'Opt in a phone number to receive SMS. Use it to manage SMS opt-in status.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    phoneNumber: z.string().describe('The phone number to opt in'),
  }),
  execute: async ({ awsCredentials, region, phoneNumber }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new OptInPhoneNumberCommand({
          phoneNumber: phoneNumber,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Phone number ${phoneNumber} opted in successfully`,
              };
    } catch (err) {
      return { error: 'Failed to opt in a phone number to receive SMS', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
