import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFileSystemCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsUpdateFsxFileSystem = tool({
  description: 'Update an existing FSx file system. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    storageCapacity: z.number().optional().describe('New storage capacity in GiB'),
    windowsConfiguration: z.record(z.any()).optional().describe('Windows file system configuration updates'),
    lustreConfiguration: z.record(z.any()).optional().describe('Lustre file system configuration updates'),
    ontapConfiguration: z.record(z.any()).optional().describe('ONTAP file system configuration updates'),
    openZFSConfiguration: z.record(z.any()).optional().describe('OpenZFS file system configuration updates'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, clientRequestToken, storageCapacity, windowsConfiguration, lustreConfiguration, ontapConfiguration, openZFSConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new UpdateFileSystemCommand({
          FileSystemId: fileSystemId,
          ClientRequestToken: clientRequestToken,
          StorageCapacity: storageCapacity,
          WindowsConfiguration: windowsConfiguration,
          LustreConfiguration: lustreConfiguration,
          OntapConfiguration: ontapConfiguration,
          OpenZFSConfiguration: openZFSConfiguration,
      });
      const response = await client.send(command);
      return {
                  fileSystem: response.FileSystem,
              };
    } catch (err) {
      return { error: 'Failed to update an existing FSx file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
