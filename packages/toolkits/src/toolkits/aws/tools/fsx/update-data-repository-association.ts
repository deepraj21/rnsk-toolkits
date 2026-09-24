import { tool } from 'ai';
import { z } from 'zod';
import { UpdateDataRepositoryAssociationCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsUpdateFsxDataRepositoryAssociation = tool({
  description: 'Update a data repository association. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    associationId: z.string().describe('The ID of the association'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    importedFileChunkSize: z.number().optional().describe('Chunk size for imported files'),
    s3: z.record(z.any()).optional().describe('S3 configuration updates'),
  }),
  execute: async ({ awsCredentials, region, associationId, clientRequestToken, importedFileChunkSize, s3 }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new UpdateDataRepositoryAssociationCommand({
          AssociationId: associationId,
          ClientRequestToken: clientRequestToken,
          ImportedFileChunkSize: importedFileChunkSize,
          S3: s3,
      });
      const response = await client.send(command);
      return {
                  association: response.Association,
              };
    } catch (err) {
      return { error: 'Failed to update a data repository association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
