import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDataRepositoryAssociationCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDeleteFsxDataRepositoryAssociation = tool({
  description: 'Delete a data repository association. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    associationId: z.string().describe('The ID of the association to delete'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    deleteDataInFileSystem: z.boolean().optional().describe('Whether to delete data in file system'),
  }),
  execute: async ({ awsCredentials, region, associationId, clientRequestToken, deleteDataInFileSystem }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DeleteDataRepositoryAssociationCommand({
          AssociationId: associationId,
          ClientRequestToken: clientRequestToken,
          DeleteDataInFileSystem: deleteDataInFileSystem,
      });
      const response = await client.send(command);
      return {
                  associationId: response.AssociationId,
                  lifeCycle: response.Lifecycle,
                  deleteDataInFileSystem: response.DeleteDataInFileSystem,
              };
    } catch (err) {
      return { error: 'Failed to delete a data repository association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
