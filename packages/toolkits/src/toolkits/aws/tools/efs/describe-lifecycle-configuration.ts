import { tool } from 'ai';
import { z } from 'zod';
import { DescribeLifecycleConfigurationCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDescribeEfsLifecycleConfiguration = tool({
  description: 'Get lifecycle configuration for an EFS file system. Use it to inspect current state before making changes.',
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

      const command = new DescribeLifecycleConfigurationCommand({
          FileSystemId: fileSystemId,
      });
      const response = await client.send(command);
      return {
                  lifecyclePolicies: response.LifecyclePolicies || [],
              };
    } catch (err) {
      return { error: 'Failed to get lifecycle configuration for an EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
