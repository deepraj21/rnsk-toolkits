import { tool } from 'ai';
import { z } from 'zod';
import { GenerateDataKeyCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsGenerateDataKey = tool({
  description: 'Generate a data encryption key (DEK) for client-side encryption',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID, ARN, alias name, or alias ARN'),
    keySpec: z.enum(['AES_256', 'AES_128']).optional().describe('Length of the data key'),
    numberOfBytes: z.number().optional().describe('Length of data key in bytes (alternative to keySpec)'),
    encryptionContext: z.record(z.any()).optional().describe('Additional authenticated data'),
  }),
  execute: async ({ awsCredentials, region, keyId, keySpec, numberOfBytes, encryptionContext }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new GenerateDataKeyCommand({
          KeyId: keyId,
          KeySpec: keySpec,
          NumberOfBytes: numberOfBytes,
          EncryptionContext: encryptionContext,
      });
      const response = await client.send(command);
      return {
                  ...response,
                  Plaintext: response.Plaintext ? Buffer.from(response.Plaintext).toString('base64') : undefined,
                  CiphertextBlob: response.CiphertextBlob ? Buffer.from(response.CiphertextBlob).toString('base64') : undefined,
              };
    } catch (err) {
      return { error: 'Failed to generate a data encryption key (DEK) for client-side encryption', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
