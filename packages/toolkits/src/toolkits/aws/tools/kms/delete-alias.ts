import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAliasCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsDeleteKmsAlias = tool({
  description: 'Delete an alias for a KMS key. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    aliasName: z.string().describe('Alias name to delete'),
  }),
  execute: async ({ awsCredentials, region, aliasName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new DeleteAliasCommand({
          AliasName: aliasName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete an alias for a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
