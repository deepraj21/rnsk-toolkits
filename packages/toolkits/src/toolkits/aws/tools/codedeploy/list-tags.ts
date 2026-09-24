import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsListCodedeployTags = tool({
  description: 'List tags for a CodeDeploy resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          ResourceArn: resourceArn,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a CodeDeploy resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
