import { tool } from 'ai';
import { z } from 'zod';
import { CreateVolumeFromBackupCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsRestoreFsxVolumeFromBackup = tool({
  description: 'Create an FSx volume from a backup. Use it to restore from a backup.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupId: z.string().describe('The ID of the backup to restore from'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    name: z.string().optional().describe('Name for the restored volume'),
  }),
  execute: async ({ awsCredentials, region, backupId, clientRequestToken, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CreateVolumeFromBackupCommand({
          BackupId: backupId,
          ClientRequestToken: clientRequestToken,
          Name: name,
      });
      const response = await client.send(command);
      return {
                  volume: response.Volume,
              };
    } catch (err) {
      return { error: 'Failed to create an FSx volume from a backup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
