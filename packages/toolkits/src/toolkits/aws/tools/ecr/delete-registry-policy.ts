import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRegistryPolicyCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsDeleteRegistryPolicy = tool({
  description: 'Delete the registry policy. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DeleteRegistryPolicyCommand({});
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  policyText: response.policyText,
              };
    } catch (err) {
      return { error: 'Failed to delete the registry policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
