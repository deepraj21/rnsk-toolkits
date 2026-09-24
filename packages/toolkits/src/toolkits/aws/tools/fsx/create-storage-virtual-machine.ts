import { tool } from 'ai';
import { z } from 'zod';
import { CreateStorageVirtualMachineCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsCreateFsxStorageVirtualMachine = tool({
  description: 'Create a storage virtual machine for an ONTAP file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    activeDirectoryConfiguration: z.record(z.any()).optional().describe('Active Directory configuration'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    fileSystemId: z.string().describe('The ID of the file system'),
    name: z.string().describe('Name of the storage virtual machine'),
    rootVolumeSecurityStyle: z.enum(['UNIX', 'NTFS', 'MIXED']).optional().describe('Root volume security style (UNIX, NTFS, MIXED)'),
    svmAdminPassword: z.string().optional().describe('SVM admin password'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, activeDirectoryConfiguration, clientRequestToken, fileSystemId, name, rootVolumeSecurityStyle, svmAdminPassword, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CreateStorageVirtualMachineCommand({
          ActiveDirectoryConfiguration: activeDirectoryConfiguration,
          ClientRequestToken: clientRequestToken,
          FileSystemId: fileSystemId,
          Name: name,
          RootVolumeSecurityStyle: rootVolumeSecurityStyle,
          SvmAdminPassword: svmAdminPassword,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  storageVirtualMachine: response.StorageVirtualMachine,
              };
    } catch (err) {
      return { error: 'Failed to create a storage virtual machine for an ONTAP file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
