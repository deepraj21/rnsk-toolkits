import { tool } from 'ai';
import { z } from 'zod';
import { DescribeIdentityProviderConfigCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDescribeEksIdentityProviderConfig = tool({
  description: 'Get details about an identity provider configuration. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    identityProviderConfig: z.record(z.any()).describe('Identity provider configuration'),
  }),
  execute: async ({ awsCredentials, region, clusterName, identityProviderConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DescribeIdentityProviderConfigCommand({
          clusterName: clusterName,
          identityProviderConfig: identityProviderConfig,
      } as any);
      const response = await client.send(command);
      return {
                  identityProviderConfig: response.identityProviderConfig,
              };
    } catch (err) {
      return { error: 'Failed to get details about an identity provider configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
