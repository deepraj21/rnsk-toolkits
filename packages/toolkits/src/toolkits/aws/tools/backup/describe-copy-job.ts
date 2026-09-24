import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCopyJobCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDescribeCopyJob = tool({
  description: 'Get details about a copy job. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    copyJobId: z.string().describe('The ID of the copy job'),
  }),
  execute: async ({ awsCredentials, region, copyJobId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DescribeCopyJobCommand({
          CopyJobId: copyJobId,
      });
      const response = await client.send(command);
      return {
                  copyJob: response.CopyJob,
              };
    } catch (err) {
      return { error: 'Failed to get details about a copy job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
