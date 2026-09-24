import { tool } from 'ai';
import { z } from 'zod';
import { DeleteFileSystemCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDeleteFsxFileSystem = tool({
  description: 'Delete an FSx file system. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system to delete'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    windowsConfiguration: z.record(z.any()).optional().describe('Windows-specific deletion options'),
    lustreConfiguration: z.record(z.any()).optional().describe('Lustre-specific deletion options'),
    openZFSConfiguration: z.record(z.any()).optional().describe('OpenZFS-specific deletion options'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, clientRequestToken, windowsConfiguration, lustreConfiguration, openZFSConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DeleteFileSystemCommand({
          FileSystemId: fileSystemId,
          ClientRequestToken: clientRequestToken,
          WindowsConfiguration: windowsConfiguration,
          LustreConfiguration: lustreConfiguration,
          OpenZFSConfiguration: openZFSConfiguration,
      });
      const response = await client.send(command);
      return {
                  fileSystemId: response.FileSystemId,
                  lifeCycle: response.Lifecycle,
              };
    } catch (err) {
      return { error: 'Failed to delete an FSx file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
