import { tool } from 'ai';
import { z } from 'zod';
import { ReEncryptCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsKmsReEncrypt = tool({
  description: 'Re-encrypt data with a different KMS key without exposing plaintext',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    ciphertextBlob: z.string().describe('Data encrypted with the source key (base64 encoded)'),
    destinationKeyId: z.string().describe('Key ID, ARN, alias name, or alias ARN for re-encryption'),
    sourceEncryptionContext: z.record(z.any()).optional().describe('Encryption context used with source key'),
    destinationEncryptionContext: z.record(z.any()).optional().describe('Encryption context for destination key'),
  }),
  execute: async ({ awsCredentials, region, ciphertextBlob, destinationKeyId, sourceEncryptionContext, destinationEncryptionContext }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new ReEncryptCommand({
          CiphertextBlob: Buffer.from(ciphertextBlob, 'base64'),
          DestinationKeyId: destinationKeyId,
          SourceEncryptionContext: sourceEncryptionContext,
          DestinationEncryptionContext: destinationEncryptionContext,
      });
      const response = await client.send(command);
      return {
                  ...response,
                  CiphertextBlob: response.CiphertextBlob ? Buffer.from(response.CiphertextBlob).toString('base64') : undefined,
              };
    } catch (err) {
      return { error: 'Failed to re-encrypt data with a different KMS key without exposing plaintext', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
