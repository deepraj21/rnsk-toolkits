import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetOnPremisesInstancesCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsBatchGetCodedeployOnPremisesInstances = tool({
  description: 'Get information about one or more on-premises instances. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceNames: z.array(z.string()).describe('The names of the on-premises instances'),
  }),
  execute: async ({ awsCredentials, region, instanceNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new BatchGetOnPremisesInstancesCommand({
          instanceNames: instanceNames,
      });
      const response = await client.send(command);
      return {
                  instancesInfo: response.instanceInfos || [],
              };
    } catch (err) {
      return { error: 'Failed to get information about one or more on-premises instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
