import { tool } from 'ai';
import { z } from 'zod';
import { DeleteArchiveCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsDeleteEventbridgeArchive = tool({
  description: 'Delete an EventBridge archive. Use it to permanently remove the resource.',
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

      const command = new DeleteArchiveCommand({
          ArchiveName: archiveName,
      });
      await client.send(command);
      return {
                  message: 'Archive deleted successfully',
                  archiveName: archiveName,
              };
    } catch (err) {
      return { error: 'Failed to delete an EventBridge archive', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
