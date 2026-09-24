import { tool } from 'ai';
import { z } from 'zod';
import { RemoveTagsFromOnPremisesInstancesCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsRemoveTagsFromCodedeployOnPremisesInstances = tool({
  description: 'Remove tags from on-premises instances. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tags: z.array(z.record(z.any())).describe('Tags to remove'),
    instanceNames: z.array(z.string()).describe('The names of the on-premises instances'),
  }),
  execute: async ({ awsCredentials, region, tags, instanceNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new RemoveTagsFromOnPremisesInstancesCommand({
          tags: tags,
          instanceNames: instanceNames,
      });
      await client.send(command);
      return {
                  message: 'Tags removed successfully',
                  instanceNames: instanceNames,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from on-premises instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
