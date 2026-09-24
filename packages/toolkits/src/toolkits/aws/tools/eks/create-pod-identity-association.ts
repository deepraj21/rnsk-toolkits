import { tool } from 'ai';
import { z } from 'zod';
import { CreatePodIdentityAssociationCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsCreateEksPodIdentityAssociation = tool({
  description: 'Create a new pod identity association. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    namespace: z.string().describe('The namespace'),
    serviceAccount: z.string().describe('The service account name'),
    roleArn: z.string().describe('IAM role ARN'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
  }),
  execute: async ({ awsCredentials, region, clusterName, namespace, serviceAccount, roleArn, tags, clientRequestToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new CreatePodIdentityAssociationCommand({
          clusterName: clusterName,
          namespace: namespace,
          serviceAccount: serviceAccount,
          roleArn: roleArn,
          tags: tags,
          clientRequestToken: clientRequestToken,
      });
      const response = await client.send(command);
      return {
                  association: response.association,
              };
    } catch (err) {
      return { error: 'Failed to create a new pod identity association', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
