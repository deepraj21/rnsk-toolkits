import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetDeploymentsCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsBatchGetCodedeployDeployments = tool({
  description: 'Get information about one or more deployments. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deploymentIds: z.array(z.string()).describe('The unique IDs of the deployments'),
  }),
  execute: async ({ awsCredentials, region, deploymentIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new BatchGetDeploymentsCommand({
          deploymentIds: deploymentIds,
      });
      const response = await client.send(command);
      return {
                  deploymentsInfo: response.deploymentsInfo || [],
              };
    } catch (err) {
      return { error: 'Failed to get information about one or more deployments', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
