import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateIdentityProviderConfigCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDisassociateEksIdentityProviderConfig = tool({
  description: 'Disassociate an identity provider configuration from a cluster. Use it to disconnect resources.',
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

      const command = new DisassociateIdentityProviderConfigCommand({
          clusterName: clusterName,
          identityProviderConfig: identityProviderConfig,
      } as any);
      const response = await client.send(command);
      return {
                  update: response.update,
              };
    } catch (err) {
      return { error: 'Failed to disassociate an identity provider configuration from a cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
