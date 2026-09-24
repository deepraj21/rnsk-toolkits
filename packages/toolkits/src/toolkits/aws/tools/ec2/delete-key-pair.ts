import { tool } from 'ai';
import { z } from 'zod';
import { DeleteKeyPairCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2KeyPair = tool({
  description: 'Delete a key pair. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyName: z.string().describe('Name of the key pair'),
  }),
  execute: async ({ awsCredentials, region, keyName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteKeyPairCommand({ KeyName: keyName });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a key pair', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
