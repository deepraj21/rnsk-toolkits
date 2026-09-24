import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEmergencyContactSettingsCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsDescribeEmergencyContactSettings = tool({
  description: 'Get emergency contact information for DDoS Response Team (DRT). Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new DescribeEmergencyContactSettingsCommand({});
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get emergency contact information for DDoS Response Team (DRT)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
