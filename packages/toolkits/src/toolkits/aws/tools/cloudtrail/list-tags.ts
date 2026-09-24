import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsListTags = tool({
  description: 'Lists the tags for the trail, event data store, or channel in the current region. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceIdList: z.array(z.string()).describe('List of resource IDs'),
  }),
  execute: async ({ awsCredentials, region, resourceIdList }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new ListTagsCommand({
          ResourceIdList: resourceIdList,
      });
      const response = await client.send(command);
      return {
                  resourceTagList: response.ResourceTagList || [],
              };
    } catch (err) {
      return { error: 'Failed to lists the tags for the trail, event data store, or channel in the current region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
