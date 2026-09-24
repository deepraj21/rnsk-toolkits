import { tool } from 'ai';
import { z } from 'zod';
import { CreateFileSystemCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsCreateFsxFileSystem = tool({
  description: 'Create a new FSx file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemType: z.enum(['WINDOWS', 'LUSTRE', 'ONTAP', 'OPENZFS']).describe('The type of file system (WINDOWS, LUSTRE, ONTAP, OPENZFS)'),
    storageCapacity: z.number().describe('Storage capacity in GiB'),
    subnetIds: z.array(z.string()).describe('Subnet IDs where the file system will be created'),
    securityGroupIds: z.array(z.string()).optional().describe('Security group IDs'),
    windowsConfiguration: z.record(z.any()).optional().describe('Windows file system configuration'),
    lustreConfiguration: z.record(z.any()).optional().describe('Lustre file system configuration'),
    ontapConfiguration: z.record(z.any()).optional().describe('ONTAP file system configuration'),
    openZFSConfiguration: z.record(z.any()).optional().describe('OpenZFS file system configuration'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the file system'),
  }),
  execute: async ({ awsCredentials, region, fileSystemType, storageCapacity, subnetIds, securityGroupIds, windowsConfiguration, lustreConfiguration, ontapConfiguration, openZFSConfiguration, kmsKeyId, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CreateFileSystemCommand({
          FileSystemType: fileSystemType,
          StorageCapacity: storageCapacity,
          SubnetIds: subnetIds,
          SecurityGroupIds: securityGroupIds,
          WindowsConfiguration: windowsConfiguration,
          LustreConfiguration: lustreConfiguration,
          OntapConfiguration: ontapConfiguration,
          OpenZFSConfiguration: openZFSConfiguration,
          KmsKeyId: kmsKeyId,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  fileSystem: response.FileSystem,
              };
    } catch (err) {
      return { error: 'Failed to create a new FSx file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
