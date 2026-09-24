import { tool } from 'ai';
import { z } from 'zod';
import { CreateAliasCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsCreateKmsAlias = tool({
  description: 'Create an alias for a KMS key. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    aliasName: z.string().describe('Alias name (must start with "alias/")'),
    targetKeyId: z.string().describe('Key ID of the KMS key'),
  }),
  execute: async ({ awsCredentials, region, aliasName, targetKeyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new CreateAliasCommand({
          AliasName: aliasName,
          TargetKeyId: targetKeyId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create an alias for a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
