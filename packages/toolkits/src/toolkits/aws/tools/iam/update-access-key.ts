import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAccessKeyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsUpdateAccessKey = tool({
  description: 'Update the status of an access key (activate or deactivate). Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accessKeyId: z.string().describe('Access key ID to update'),
    status: z.enum(['Active', 'Inactive']).describe('New status for the access key'),
    userName: z.string().optional().describe('Name of the IAM user (omit for current user)'),
  }),
  execute: async ({ awsCredentials, region, accessKeyId, status, userName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new UpdateAccessKeyCommand({
          AccessKeyId: accessKeyId,
          Status: status,
          UserName: userName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update the status of an access key (activate or deactivate)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
