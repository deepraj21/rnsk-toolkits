import { tool } from 'ai';
import { z } from 'zod';
import { UpdatePodIdentityAssociationCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUpdateEksPodIdentityAssociation = tool({
  description: 'Update a pod identity association. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    associationId: z.string().describe('The association ID'),
    roleArn: z.string().describe('IAM role ARN'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
  }),
  execute: async ({ awsCredentials, region, clusterName, associationId, roleArn, clientRequestToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UpdatePodIdentityAssociationCommand({
          clusterName: clusterName,
          associationId: associationId,
          roleArn: roleArn,
          clientRequestToken: clientRequestToken,
      });
      const response = await client.send(command);
      return {
                  association: response.association,
              };
    } catch (err) {
      return { error: 'Failed to update a pod identity association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
