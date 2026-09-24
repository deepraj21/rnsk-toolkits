import { tool } from 'ai';
import { z } from 'zod';
import { ListBuildsCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsListCodebuildBuilds = tool({
  description: 'List build IDs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sortOrder: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('The order to list build IDs'),
    nextToken: z.string().optional().describe('During a previous call, if there are more than 100 items in the list'),
  }),
  execute: async ({ awsCredentials, region, sortOrder, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new ListBuildsCommand({
          sortOrder: sortOrder as any,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  ids: response.ids || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list build IDs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
