import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDeploymentCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsDeleteDeployment = tool({
  description: 'Deletes a Deployment resource. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    deploymentId: z.string().describe('The identifier of the Deployment resource'),
  }),
  execute: async ({ awsCredentials, region, restApiId, deploymentId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new DeleteDeploymentCommand({
          restApiId: restApiId,
          deploymentId: deploymentId,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a Deployment resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
