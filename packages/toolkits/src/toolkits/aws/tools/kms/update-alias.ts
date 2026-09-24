import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAliasCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsUpdateKmsAlias = tool({
  description: 'Associate an existing alias with a different KMS key. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    aliasName: z.string().describe('Alias name to update'),
    targetKeyId: z.string().describe('New key ID to associate with the alias'),
  }),
  execute: async ({ awsCredentials, region, aliasName, targetKeyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new UpdateAliasCommand({
          AliasName: aliasName,
          TargetKeyId: targetKeyId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to associate an existing alias with a different KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
