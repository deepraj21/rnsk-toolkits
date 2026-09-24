import { tool } from 'ai';
import { z } from 'zod';
import { CreateBackupCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsCreateFsxBackup = tool({
  description: 'Create a backup of an FSx file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system to backup'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the backup'),
    volumeId: z.string().optional().describe('The ID of the volume to backup (for ONTAP)'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, clientRequestToken, tags, volumeId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CreateBackupCommand({
          FileSystemId: fileSystemId,
          ClientRequestToken: clientRequestToken,
          Tags: tags,
          VolumeId: volumeId,
      } as any);
      const response = await client.send(command);
      return {
                  backup: response.Backup,
              };
    } catch (err) {
      return { error: 'Failed to create a backup of an FSx file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
