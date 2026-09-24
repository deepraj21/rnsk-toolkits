import { tool } from 'ai';
import { z } from 'zod';
import { PutLifecycleConfigurationCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsPutEfsLifecycleConfiguration = tool({
  description: 'Create or update lifecycle configuration for an EFS file system. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system'),
    lifecyclePolicies: z.array(z.enum(['AFTER_7_DAYS', 'AFTER_14_DAYS', 'AFTER_30_DAYS', 'AFTER_60_DAYS', 'AFTER_90_DAYS'])).describe('Lifecycle policies to apply'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, lifecyclePolicies }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new PutLifecycleConfigurationCommand({
          FileSystemId: fileSystemId,
          LifecyclePolicies: lifecyclePolicies.map(policy => ({ 
              TransitionToIA: policy as 'AFTER_7_DAYS' | 'AFTER_14_DAYS' | 'AFTER_30_DAYS' | 'AFTER_60_DAYS' | 'AFTER_90_DAYS'
          })),
      });
      const response = await client.send(command);
      return {
                  lifecyclePolicies: response.LifecyclePolicies || [],
              };
    } catch (err) {
      return { error: 'Failed to create or update lifecycle configuration for an EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
