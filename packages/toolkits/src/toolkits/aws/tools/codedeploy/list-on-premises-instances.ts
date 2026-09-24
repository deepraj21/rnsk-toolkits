import { tool } from 'ai';
import { z } from 'zod';
import { ListOnPremisesInstancesCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsListCodedeployOnPremisesInstances = tool({
  description: 'List on-premises instances. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new ListOnPremisesInstancesCommand({
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  instanceNames: response.instanceNames || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list on-premises instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
