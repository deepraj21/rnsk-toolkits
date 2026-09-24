import { tool } from 'ai';
import { z } from 'zod';
import { PutLifecycleConfigurationCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDeleteEfsLifecycleConfiguration = tool({
  description: 'Delete lifecycle configuration for an EFS file system (sets to empty). Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      // Delete lifecycle configuration by setting it to empty array
      const command = new PutLifecycleConfigurationCommand({
          FileSystemId: fileSystemId,
          LifecyclePolicies: [],
      });
      const response = await client.send(command);
      return {
                  message: 'Lifecycle configuration deleted successfully',
                  fileSystemId: fileSystemId,
                  lifecyclePolicies: response.LifecyclePolicies || [],
              };
    } catch (err) {
      return { error: 'Failed to delete lifecycle configuration for an EFS file system (sets to empty)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
