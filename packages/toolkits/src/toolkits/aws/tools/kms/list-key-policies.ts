import { tool } from 'ai';
import { z } from 'zod';
import { ListKeyPoliciesCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsListKeyPolicies = tool({
  description: 'List the names of key policies for a KMS key. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    limit: z.number().optional().describe('Maximum number of policies to return'),
    marker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, keyId, limit, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new ListKeyPoliciesCommand({
          KeyId: keyId,
          Limit: limit,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list the names of key policies for a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
