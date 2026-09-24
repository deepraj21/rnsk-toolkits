import { tool } from 'ai';
import { z } from 'zod';
import { CreateDataRepositoryAssociationCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsCreateFsxDataRepositoryAssociation = tool({
  description: 'Create a data repository association for an FSx file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system'),
    fileSystemPath: z.string().describe('Path on the file system'),
    dataRepositoryPath: z.string().describe('Path in the data repository'),
    batchImportMetaDataOnCreate: z.boolean().optional().describe('Import metadata on creation'),
    importedFileChunkSize: z.number().optional().describe('Chunk size for imported files'),
    s3: z.record(z.any()).optional().describe('S3 configuration'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, fileSystemPath, dataRepositoryPath, batchImportMetaDataOnCreate, importedFileChunkSize, s3, clientRequestToken, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CreateDataRepositoryAssociationCommand({
          FileSystemId: fileSystemId,
          FileSystemPath: fileSystemPath,
          DataRepositoryPath: dataRepositoryPath,
          BatchImportMetaDataOnCreate: batchImportMetaDataOnCreate,
          ImportedFileChunkSize: importedFileChunkSize,
          S3: s3,
          ClientRequestToken: clientRequestToken,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  association: response.Association,
              };
    } catch (err) {
      return { error: 'Failed to create a data repository association for an FSx file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
