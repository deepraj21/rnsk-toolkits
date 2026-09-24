import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListBackupTags = tool({
  description: 'List tags for a backup resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of tags to return'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListTagsCommand({
          ResourceArn: resourceArn,
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || {},
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a backup resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
