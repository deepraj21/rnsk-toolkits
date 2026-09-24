import { tool } from 'ai';
import { z } from 'zod';
import { DeleteStorageVirtualMachineCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDeleteFsxStorageVirtualMachine = tool({
  description: 'Delete a storage virtual machine. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    storageVirtualMachineId: z.string().describe('The ID of the SVM to delete'),
  }),
  execute: async ({ awsCredentials, region, clientRequestToken, storageVirtualMachineId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DeleteStorageVirtualMachineCommand({
          ClientRequestToken: clientRequestToken,
          StorageVirtualMachineId: storageVirtualMachineId,
      });
      const response = await client.send(command);
      return {
                  storageVirtualMachineId: response.StorageVirtualMachineId,
                  lifeCycle: response.Lifecycle,
              };
    } catch (err) {
      return { error: 'Failed to delete a storage virtual machine', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
