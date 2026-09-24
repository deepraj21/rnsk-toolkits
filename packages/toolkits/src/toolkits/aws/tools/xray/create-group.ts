import { tool } from 'ai';
import { z } from 'zod';
import { CreateGroupCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsCreateGroup = tool({
  description: 'Creates a group resource with a name and a filter expression. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('The case-sensitive name of the new group'),
    filterExpression: z.string().optional().describe('The filter expression defining criteria by which to group traces'),
    insightsConfiguration: z.record(z.any()).optional().describe('Structure containing configurations related to insights'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the group'),
  }),
  execute: async ({ awsCredentials, region, groupName, filterExpression, insightsConfiguration, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new CreateGroupCommand({
          GroupName: groupName,
          FilterExpression: filterExpression,
          InsightsConfiguration: insightsConfiguration,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  group: response.Group,
              };
    } catch (err) {
      return { error: 'Failed to creates a group resource with a name and a filter expression', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
