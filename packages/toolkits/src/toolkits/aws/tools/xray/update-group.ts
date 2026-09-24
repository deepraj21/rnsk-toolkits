import { tool } from 'ai';
import { z } from 'zod';
import { UpdateGroupCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsUpdateGroup = tool({
  description: 'Updates a group resource. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().optional().describe('The case-sensitive name of the group'),
    groupARN: z.string().optional().describe('The ARN of the group'),
    filterExpression: z.string().optional().describe('The updated filter expression'),
    insightsConfiguration: z.record(z.any()).optional().describe('Structure containing configurations related to insights'),
  }),
  execute: async ({ awsCredentials, region, groupName, groupARN, filterExpression, insightsConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new UpdateGroupCommand({
          GroupName: groupName,
          GroupARN: groupARN,
          FilterExpression: filterExpression,
          InsightsConfiguration: insightsConfiguration,
      });
      const response = await client.send(command);
      return {
                  group: response.Group,
              };
    } catch (err) {
      return { error: 'Failed to updates a group resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
