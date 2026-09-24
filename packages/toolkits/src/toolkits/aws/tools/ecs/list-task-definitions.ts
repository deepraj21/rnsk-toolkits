import { tool } from 'ai';
import { z } from 'zod';
import { ListTaskDefinitionsCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsTaskDefinitions = tool({
  description: 'List all task definitions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    familyPrefix: z.string().optional().describe('Filter by family prefix'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().describe('Filter by status (ACTIVE, INACTIVE)'),
    sort: z.enum(['ASC', 'DESC']).optional().describe('Sort by (ASC, DESC)'),
    maxResults: z.number().optional().describe('Maximum number of task definitions to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, familyPrefix, status, sort, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new ListTaskDefinitionsCommand({
          familyPrefix: familyPrefix,
          status: status as any,
          sort: sort as any,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  taskDefinitionArns: response.taskDefinitionArns || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all task definitions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
