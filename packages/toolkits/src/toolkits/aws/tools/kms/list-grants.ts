import { tool } from 'ai';
import { z } from 'zod';
import { ListGrantsCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsListGrants = tool({
  description: 'List grants for a KMS key. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    grantId: z.string().optional().describe('Grant ID to retrieve specific grant'),
    limit: z.number().optional().describe('Maximum number of grants to return'),
    marker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, keyId, grantId, limit, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new ListGrantsCommand({
          KeyId: keyId,
          GrantId: grantId,
          Limit: limit,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list grants for a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
