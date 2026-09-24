import { tool } from 'ai';
import { z } from 'zod';
import { UpdateEmergencyContactSettingsCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsUpdateEmergencyContactSettings = tool({
  description: 'Update emergency contact information for DRT notifications. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    emergencyContactList: z.array(z.record(z.any())).optional().describe('List of emergency contacts (up to 10)'),
  }),
  execute: async ({ awsCredentials, region, emergencyContactList }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new UpdateEmergencyContactSettingsCommand({
          EmergencyContactList: emergencyContactList,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update emergency contact information for DRT notifications', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
