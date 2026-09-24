import { tool } from 'ai';
import { z } from 'zod';
import { DecryptCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsKmsDecrypt = tool({
  description: 'Decrypt ciphertext that was encrypted with a KMS key',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    ciphertextBlob: z.string().describe('Encrypted data (base64 encoded)'),
    encryptionContext: z.record(z.any()).optional().describe('Additional authenticated data used during encryption'),
    keyId: z.string().optional().describe('Key ID or ARN (optional, KMS can determine from ciphertext)'),
  }),
  execute: async ({ awsCredentials, region, ciphertextBlob, encryptionContext, keyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new DecryptCommand({
          CiphertextBlob: Buffer.from(ciphertextBlob, 'base64'),
          EncryptionContext: encryptionContext,
          KeyId: keyId,
      });
      const response = await client.send(command);
      return {
                  ...response,
                  Plaintext: response.Plaintext ? Buffer.from(response.Plaintext).toString('utf8') : undefined,
              };
    } catch (err) {
      return { error: 'Failed to decrypt ciphertext that was encrypted with a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
