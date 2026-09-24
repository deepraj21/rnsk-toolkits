import { tool } from 'ai';
import { z } from 'zod';
import { AddTagsToOnPremisesInstancesCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsAddTagsToCodedeployOnPremisesInstances = tool({
  description: 'Add tags to on-premises instances. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tags: z.array(z.record(z.any())).describe('Tags to add'),
    instanceNames: z.array(z.string()).describe('The names of the on-premises instances'),
  }),
  execute: async ({ awsCredentials, region, tags, instanceNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new AddTagsToOnPremisesInstancesCommand({
          tags: tags,
          instanceNames: instanceNames,
      });
      await client.send(command);
      return {
                  message: 'Tags added successfully',
                  instanceNames: instanceNames,
              };
    } catch (err) {
      return { error: 'Failed to add tags to on-premises instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
