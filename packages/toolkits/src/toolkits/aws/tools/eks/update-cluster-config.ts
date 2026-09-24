import { tool } from 'ai';
import { z } from 'zod';
import { UpdateClusterConfigCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUpdateEksClusterConfig = tool({
  description: 'Update the configuration of an EKS cluster. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the cluster'),
    resourcesVpcConfig: z.record(z.any()).optional().describe('VPC configuration'),
    logging: z.record(z.any()).optional().describe('Logging configuration'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
    accessConfig: z.record(z.any()).optional().describe('Access configuration'),
  }),
  execute: async ({ awsCredentials, region, name, resourcesVpcConfig, logging, clientRequestToken, accessConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UpdateClusterConfigCommand({
          name: name,
          resourcesVpcConfig: resourcesVpcConfig,
          logging: logging,
          clientRequestToken: clientRequestToken,
          accessConfig: accessConfig,
      });
      const response = await client.send(command);
      return {
                  update: response.update,
              };
    } catch (err) {
      return { error: 'Failed to update the configuration of an EKS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
