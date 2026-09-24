import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53TagsForResource = tool({
  description: 'List tags for a Route 53 resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceType: z.enum(['healthcheck', 'hostedzone']).describe('The type of resource'),
    resourceId: z.string().describe('The resource ID'),
  }),
  execute: async ({ awsCredentials, region, resourceType, resourceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          ResourceType: resourceType as any,
          ResourceId: resourceId,
      });
      const response = await client.send(command);
      return {
                  resourceTagSet: response.ResourceTagSet,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a Route 53 resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
