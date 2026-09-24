import { tool } from 'ai';
import { z } from 'zod';
import { CreateKeyPairCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2KeyPair = tool({
  description: 'Create a new key pair. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyName: z.string().describe('Name of the key pair'),
    keyType: z.string().optional().describe('Key type (rsa or ed25519)'),
    tagSpecifications: z.array(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, keyName, keyType, tagSpecifications }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateKeyPairCommand({
          KeyName: keyName,
          KeyType: keyType as any,
          TagSpecifications: tagSpecifications,
      });
      const response = await client.send(command);
      return { keyPair: response };
    } catch (err) {
      return { error: 'Failed to create a new key pair', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
