import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsListEfsTags = tool({
  description: 'List tags for an EFS resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceId: z.string().describe('The ID of the resource (file system, access point, etc.)'),
  }),
  execute: async ({ awsCredentials, region, resourceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          ResourceId: resourceId,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
              };
    } catch (err) {
      return { error: 'Failed to list tags for an EFS resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
