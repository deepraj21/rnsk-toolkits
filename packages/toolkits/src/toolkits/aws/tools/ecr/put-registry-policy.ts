import { tool } from 'ai';
import { z } from 'zod';
import { PutRegistryPolicyCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsPutRegistryPolicy = tool({
  description: 'Create or update the registry policy. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    policyText: z.string().describe('The JSON registry policy text'),
  }),
  execute: async ({ awsCredentials, region, policyText }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new PutRegistryPolicyCommand({
          policyText: policyText,
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  policyText: response.policyText,
              };
    } catch (err) {
      return { error: 'Failed to create or update the registry policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
