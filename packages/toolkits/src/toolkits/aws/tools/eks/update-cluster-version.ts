import { tool } from 'ai';
import { z } from 'zod';
import { UpdateClusterVersionCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUpdateEksClusterVersion = tool({
  description: 'Update the Kubernetes version of an EKS cluster. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the cluster'),
    version: z.string().describe('Kubernetes version to update to'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
  }),
  execute: async ({ awsCredentials, region, name, version, clientRequestToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UpdateClusterVersionCommand({
          name: name,
          version: version,
          clientRequestToken: clientRequestToken,
      });
      const response = await client.send(command);
      return {
                  update: response.update,
              };
    } catch (err) {
      return { error: 'Failed to update the Kubernetes version of an EKS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
