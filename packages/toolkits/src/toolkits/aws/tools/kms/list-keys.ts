import { tool } from 'ai';
import { z } from 'zod';
import { ListKeysCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsListKmsKeys = tool({
  description: 'List all KMS keys in the AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    limit: z.number().optional().describe('Maximum number of keys to return (1-1000)'),
    marker: z.string().optional().describe('Pagination marker from previous response'),
  }),
  execute: async ({ awsCredentials, region, limit, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new ListKeysCommand({
          Limit: limit,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all KMS keys in the AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
