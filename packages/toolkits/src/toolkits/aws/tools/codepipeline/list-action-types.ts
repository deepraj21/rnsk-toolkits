import { tool } from 'ai';
import { z } from 'zod';
import { ListActionTypesCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsListCodepipelineActionTypes = tool({
  description: 'List available action types. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    actionOwnerFilter: z.enum(['AWS', 'ThirdParty', 'Custom']).optional().describe('Filter by action owner'),
    nextToken: z.string().optional().describe('Token for pagination'),
    regionFilter: z.string().optional().describe('Filter by region'),
  }),
  execute: async ({ awsCredentials, region, actionOwnerFilter, nextToken, regionFilter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new ListActionTypesCommand({
          actionOwnerFilter: actionOwnerFilter as any,
          nextToken: nextToken,
          regionFilter: regionFilter,
      });
      const response = await client.send(command);
      return {
                  actionTypes: response.actionTypes || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list available action types', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
