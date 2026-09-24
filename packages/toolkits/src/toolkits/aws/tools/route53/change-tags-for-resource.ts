import { tool } from 'ai';
import { z } from 'zod';
import { ChangeTagsForResourceCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsChangeRoute53TagsForResource = tool({
  description: 'Add or remove tags from a Route 53 resource',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceType: z.enum(['healthcheck', 'hostedzone']).describe('The type of resource'),
    resourceId: z.string().describe('The resource ID'),
    addTags: z.array(z.record(z.any())).optional().describe('Tags to add'),
    removeTagKeys: z.array(z.string()).optional().describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceType, resourceId, addTags, removeTagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ChangeTagsForResourceCommand({
          ResourceType: resourceType as any,
          ResourceId: resourceId,
          AddTags: addTags,
          RemoveTagKeys: removeTagKeys,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags updated successfully for resource ${resourceId}`,
              };
    } catch (err) {
      return { error: 'Failed to add or remove tags from a Route 53 resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
