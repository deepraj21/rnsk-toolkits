import { tool } from 'ai';
import { z } from 'zod';
import { CopyBackupCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsCopyFsxBackup = tool({
  description: 'Copy an FSx backup to another region. Use it to duplicate data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sourceBackupId: z.string().describe('The ID of the source backup'),
    sourceRegion: z.string().optional().describe('The region of the source backup'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
    copyTags: z.boolean().optional().describe('Whether to copy tags from source backup'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the copied backup'),
  }),
  execute: async ({ awsCredentials, region, sourceBackupId, sourceRegion, clientRequestToken, kmsKeyId, copyTags, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CopyBackupCommand({
          SourceBackupId: sourceBackupId,
          SourceRegion: sourceRegion,
          ClientRequestToken: clientRequestToken,
          KmsKeyId: kmsKeyId,
          CopyTags: copyTags,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  backup: response.Backup,
              };
    } catch (err) {
      return { error: 'Failed to copy an FSx backup to another region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
