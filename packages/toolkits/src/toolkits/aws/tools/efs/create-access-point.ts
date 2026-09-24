import { tool } from 'ai';
import { z } from 'zod';
import { CreateAccessPointCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsCreateEfsAccessPoint = tool({
  description: 'Create an access point for an EFS file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system'),
    posixUser: z.record(z.any()).optional().describe('POSIX user configuration'),
    rootDirectory: z.record(z.any()).optional().describe('Root directory configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the access point'),
    clientToken: z.string().optional().describe('Client token for idempotency'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, posixUser, rootDirectory, tags, clientToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new CreateAccessPointCommand({
          FileSystemId: fileSystemId,
          PosixUser: posixUser,
          RootDirectory: rootDirectory,
          Tags: tags,
          ClientToken: clientToken,
      } as any);
      const response = await client.send(command);
      return {
                  accessPoint: response,
              };
    } catch (err) {
      return { error: 'Failed to create an access point for an EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
