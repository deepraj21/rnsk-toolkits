import { tool } from 'ai';
import { z } from 'zod';
import { DeleteFileSystemCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDeleteEfsFileSystem = tool({
  description: 'Delete an EFS file system. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system to delete'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DeleteFileSystemCommand({
          FileSystemId: fileSystemId,
      });
      await client.send(command);
      return {
                  message: 'File system deletion initiated',
                  fileSystemId: fileSystemId,
              };
    } catch (err) {
      return { error: 'Failed to delete an EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
