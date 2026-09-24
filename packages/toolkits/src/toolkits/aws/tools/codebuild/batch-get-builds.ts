import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetBuildsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsBatchGetCodebuildBuilds = tool({
  description: 'Get information about one or more builds. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    ids: z.array(z.string()).describe('The IDs of the builds'),
  }),
  execute: async ({ awsCredentials, region, ids }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new BatchGetBuildsCommand({
          ids: ids,
      });
      const response = await client.send(command);
      return {
                  builds: response.builds || [],
                  buildsNotFound: response.buildsNotFound || [],
              };
    } catch (err) {
      return { error: 'Failed to get information about one or more builds', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
