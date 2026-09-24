import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFileSystemCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsUpdateEfsFileSystem = tool({
  description: 'Update an EFS file system. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system to update'),
    throughputMode: z.enum(['bursting', 'provisioned']).optional().describe('Throughput mode (bursting, provisioned)'),
    provisionedThroughputInMibps: z.number().optional().describe('Provisioned throughput in MiB/s (required if throughputMode is provisioned)'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, throughputMode, provisionedThroughputInMibps }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new UpdateFileSystemCommand({
          FileSystemId: fileSystemId,
          ThroughputMode: throughputMode,
          ProvisionedThroughputInMibps: provisionedThroughputInMibps,
      });
      const response = await client.send(command);
      return {
                  fileSystem: response,
              };
    } catch (err) {
      return { error: 'Failed to update an EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
