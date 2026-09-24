import { tool } from 'ai';
import { z } from 'zod';
import { EnableMFADeviceCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsEnableMfaDevice = tool({
  description: 'Enable an MFA device for an IAM user. Use it to enable a feature.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().describe('Name of the IAM user'),
    serialNumber: z.string().describe('Serial number of the MFA device'),
    authenticationCode1: z.string().describe('First authentication code from the MFA device'),
    authenticationCode2: z.string().describe('Second authentication code from the MFA device'),
  }),
  execute: async ({ awsCredentials, region, userName, serialNumber, authenticationCode1, authenticationCode2 }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new EnableMFADeviceCommand({
          UserName: userName,
          SerialNumber: serialNumber,
          AuthenticationCode1: authenticationCode1,
          AuthenticationCode2: authenticationCode2,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to enable an MFA device for an IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
