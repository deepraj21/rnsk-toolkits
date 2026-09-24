import { tool } from 'ai';
import { z } from 'zod';
import { DeletePodIdentityAssociationCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDeleteEksPodIdentityAssociation = tool({
  description: 'Delete a pod identity association. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    associationId: z.string().describe('The association ID'),
  }),
  execute: async ({ awsCredentials, region, clusterName, associationId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DeletePodIdentityAssociationCommand({
          clusterName: clusterName,
          associationId: associationId,
      });
      const response = await client.send(command);
      return {
                  association: response.association,
              };
    } catch (err) {
      return { error: 'Failed to delete a pod identity association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
