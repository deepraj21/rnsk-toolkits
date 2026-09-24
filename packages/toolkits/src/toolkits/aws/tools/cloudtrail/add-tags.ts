import { tool } from 'ai';
import { z } from 'zod';
import { AddTagsCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsAddTags = tool({
  description: 'Adds one or more tags to a trail, event data store, or channel. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceId: z.string().describe('The ID of the resource'),
    tagsList: z.array(z.record(z.any())).describe('List of tags to add'),
  }),
  execute: async ({ awsCredentials, region, resourceId, tagsList }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new AddTagsCommand({
          ResourceId: resourceId,
          TagsList: tagsList,
      } as any);
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to adds one or more tags to a trail, event data store, or channel', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
