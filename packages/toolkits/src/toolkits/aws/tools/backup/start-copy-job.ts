import { tool } from 'ai';
import { z } from 'zod';
import { StartCopyJobCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsStartCopyJob = tool({
  description: 'Start a copy job. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    recoveryPointArn: z.string().describe('The ARN of the recovery point to copy'),
    sourceBackupVaultName: z.string().describe('The name of the source backup vault'),
    destinationBackupVaultArn: z.string().describe('The ARN of the destination backup vault'),
    iamRoleArn: z.string().describe('The ARN of the IAM role'),
    idempotencyToken: z.string().optional().describe('A unique token for idempotency'),
    lifecycle: z.record(z.any()).optional().describe('Lifecycle configuration'),
  }),
  execute: async ({ awsCredentials, region, recoveryPointArn, sourceBackupVaultName, destinationBackupVaultArn, iamRoleArn, idempotencyToken, lifecycle }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new StartCopyJobCommand({
          RecoveryPointArn: recoveryPointArn,
          SourceBackupVaultName: sourceBackupVaultName,
          DestinationBackupVaultArn: destinationBackupVaultArn,
          IamRoleArn: iamRoleArn,
          IdempotencyToken: idempotencyToken,
          Lifecycle: lifecycle,
      });
      const response = await client.send(command);
      return {
                  copyJobId: response.CopyJobId,
                  creationDate: response.CreationDate,
              };
    } catch (err) {
      return { error: 'Failed to start a copy job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
