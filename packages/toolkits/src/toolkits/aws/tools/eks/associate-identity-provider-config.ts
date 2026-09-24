import { tool } from 'ai';
import { z } from 'zod';
import { AssociateIdentityProviderConfigCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsAssociateEksIdentityProviderConfig = tool({
  description: 'Associate an identity provider configuration with a cluster. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    oidc: z.record(z.any()).describe('OIDC identity provider configuration'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
  }),
  execute: async ({ awsCredentials, region, clusterName, oidc, tags, clientRequestToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new AssociateIdentityProviderConfigCommand({
          clusterName: clusterName,
          oidc: oidc,
          tags: tags,
          clientRequestToken: clientRequestToken,
      } as any);
      const response = await client.send(command);
      return {
                  update: response.update,
                  tags: response.tags || {},
              };
    } catch (err) {
      return { error: 'Failed to associate an identity provider configuration with a cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
