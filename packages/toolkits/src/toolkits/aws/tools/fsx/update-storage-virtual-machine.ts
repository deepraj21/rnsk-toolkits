import { tool } from 'ai';
import { z } from 'zod';
import { UpdateStorageVirtualMachineCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsUpdateFsxStorageVirtualMachine = tool({
  description: 'Update a storage virtual machine. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    activeDirectoryConfiguration: z.record(z.any()).optional().describe('Active Directory configuration updates'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    storageVirtualMachineId: z.string().describe('The ID of the SVM'),
    svmAdminPassword: z.string().optional().describe('New SVM admin password'),
  }),
  execute: async ({ awsCredentials, region, activeDirectoryConfiguration, clientRequestToken, storageVirtualMachineId, svmAdminPassword }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new UpdateStorageVirtualMachineCommand({
          ActiveDirectoryConfiguration: activeDirectoryConfiguration,
          ClientRequestToken: clientRequestToken,
          StorageVirtualMachineId: storageVirtualMachineId,
          SvmAdminPassword: svmAdminPassword,
      });
      const response = await client.send(command);
      return {
                  storageVirtualMachine: response.StorageVirtualMachine,
              };
    } catch (err) {
      return { error: 'Failed to update a storage virtual machine', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
