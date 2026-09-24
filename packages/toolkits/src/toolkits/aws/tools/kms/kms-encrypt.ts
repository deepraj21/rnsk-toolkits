import { tool } from 'ai';
import { z } from 'zod';
import { EncryptCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsKmsEncrypt = tool({
  description: 'Encrypt plaintext data using a KMS key',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID, ARN, alias name, or alias ARN'),
    plaintext: z.string().describe('Data to encrypt (base64 encoded for binary data)'),
    encryptionContext: z.record(z.any()).optional().describe('Additional authenticated data (key-value pairs)'),
  }),
  execute: async ({ awsCredentials, region, keyId, plaintext, encryptionContext }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new EncryptCommand({
          KeyId: keyId,
          Plaintext: Buffer.from(plaintext),
          EncryptionContext: encryptionContext,
      });
      const response = await client.send(command);
      return {
                  ...response,
                  CiphertextBlob: response.CiphertextBlob ? Buffer.from(response.CiphertextBlob).toString('base64') : undefined,
              };
    } catch (err) {
      return { error: 'Failed to encrypt plaintext data using a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
