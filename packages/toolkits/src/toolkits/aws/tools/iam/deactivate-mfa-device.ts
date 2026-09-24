import { tool } from 'ai';
import { z } from 'zod';
import { DeactivateMFADeviceCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsDeactivateMfaDevice = tool({
  description: 'Deactivate an MFA device for an IAM user',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().describe('Name of the IAM user'),
    serialNumber: z.string().describe('Serial number of the MFA device'),
  }),
  execute: async ({ awsCredentials, region, userName, serialNumber }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new DeactivateMFADeviceCommand({
          UserName: userName,
          SerialNumber: serialNumber,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to deactivate an MFA device for an IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
