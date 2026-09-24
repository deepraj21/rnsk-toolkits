import { tool } from 'ai';
import { z } from 'zod';
import { DescribeArchiveCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDescribeEventbridgeArchive = tool({
  description: 'Get details about an EventBridge archive. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    archiveName: z.string().describe('Name of the archive'),
  }),
  execute: async ({ awsCredentials, region, archiveName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new DescribeArchiveCommand({
          ArchiveName: archiveName,
      });
      const response = await client.send(command);
      return {
                  archive: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about an EventBridge archive', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
