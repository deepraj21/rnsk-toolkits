import { tool } from 'ai';
import { z } from 'zod';
import { CreateFileSystemCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsCreateEfsFileSystem = tool({
  description: 'Create a new EFS file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    creationToken: z.string().describe('A unique token to ensure idempotency'),
    performanceMode: z.enum(['generalPurpose', 'maxIO']).optional().describe('Performance mode (generalPurpose or maxIO)'),
    encrypted: z.boolean().optional().describe('Whether to encrypt the file system'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
    throughputMode: z.enum(['bursting', 'provisioned']).optional().describe('Throughput mode (bursting, provisioned)'),
    provisionedThroughputInMibps: z.number().optional().describe('Provisioned throughput in MiB/s (required if throughputMode is provisioned)'),
    availabilityZoneName: z.string().optional().describe('Availability zone name (for One Zone file systems)'),
    backup: z.boolean().optional().describe('Whether to enable automatic backups'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the file system'),
  }),
  execute: async ({ awsCredentials, region, creationToken, performanceMode, encrypted, kmsKeyId, throughputMode, provisionedThroughputInMibps, availabilityZoneName, backup, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new CreateFileSystemCommand({
          CreationToken: creationToken,
          PerformanceMode: performanceMode,
          Encrypted: encrypted,
          KmsKeyId: kmsKeyId,
          ThroughputMode: throughputMode,
          ProvisionedThroughputInMibps: provisionedThroughputInMibps,
          AvailabilityZoneName: availabilityZoneName,
          Backup: backup,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  fileSystem: response,
              };
    } catch (err) {
      return { error: 'Failed to create a new EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
