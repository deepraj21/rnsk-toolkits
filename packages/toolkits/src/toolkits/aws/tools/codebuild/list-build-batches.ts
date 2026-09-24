import { tool } from 'ai';
import { z } from 'zod';
import { ListBuildBatchesCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsListCodebuildBuildBatches = tool({
  description: 'Retrieves the identifiers of your build batches. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filter: z.enum(['SUCCEEDED', 'FAILED', 'FAULT', 'TIMED_OUT', 'IN_PROGRESS', 'STOPPED']).optional().describe('filter'),
    maxResults: z.number().optional().describe('The maximum number of results to return'),
    sortOrder: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('sortOrder'),
    nextToken: z.string().optional().describe('nextToken'),
  }),
  execute: async ({ awsCredentials, region, filter, maxResults, sortOrder, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new ListBuildBatchesCommand({
          filter: filter,
          maxResults: maxResults,
          sortOrder: sortOrder as any,
          nextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  ids: response.ids || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the identifiers of your build batches', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
