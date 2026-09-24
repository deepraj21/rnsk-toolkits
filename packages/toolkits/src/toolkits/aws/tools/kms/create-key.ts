import { tool } from 'ai';
import { z } from 'zod';
import { CreateKeyCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsCreateKmsKey = tool({
  description: 'Create a new KMS key. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    description: z.string().optional().describe('Description of the key'),
    keyUsage: z.enum(['ENCRYPT_DECRYPT', 'SIGN_VERIFY']).optional().describe('Cryptographic operations for which the key can be used'),
    origin: z.enum(['AWS_KMS', 'EXTERNAL', 'AWS_CLOUDHSM']).optional().describe('Source of the key material'),
    multiRegion: z.boolean().optional().describe('Create a multi-Region key'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to attach to the key'),
  }),
  execute: async ({ awsCredentials, region, description, keyUsage, origin, multiRegion, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new CreateKeyCommand({
          Description: description,
          KeyUsage: keyUsage,
          Origin: origin,
          MultiRegion: multiRegion,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
