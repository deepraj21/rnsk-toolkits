import { tool } from 'ai';
import { z } from 'zod';
import { GetDeploymentCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsGetDeployment = tool({
  description: 'Gets information about a Deployment resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    deploymentId: z.string().describe('The identifier of the Deployment resource'),
    embed: z.array(z.string()).optional().describe('A query parameter to retrieve the deployment in a specific format'),
  }),
  execute: async ({ awsCredentials, region, restApiId, deploymentId, embed }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetDeploymentCommand({
          restApiId: restApiId,
          deploymentId: deploymentId,
          embed: embed,
      });
      const response = await client.send(command);
      return {
                  id: response.id,
                  description: response.description,
                  createdDate: response.createdDate,
                  apiSummary: response.apiSummary,
              };
    } catch (err) {
      return { error: 'Failed to gets information about a Deployment resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
