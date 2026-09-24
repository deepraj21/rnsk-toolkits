import { tool } from 'ai';
import { z } from 'zod';
import { ImportKeyPairCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsImportEc2KeyPair = tool({
  description: 'Import a public key to create a key pair. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyName: z.string().describe('Name of the key pair'),
    publicKeyMaterial: z.string().describe('Public key material'),
  }),
  execute: async ({ awsCredentials, region, keyName, publicKeyMaterial }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new ImportKeyPairCommand({
          KeyName: keyName,
          PublicKeyMaterial: new TextEncoder().encode(publicKeyMaterial),
      });
      const response = await client.send(command);
      return { keyPair: response };
    } catch (err) {
      return { error: 'Failed to import a public key to create a key pair', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
