import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsTagEfsResource = tool({
  description: 'Add tags to an EFS resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceId: z.string().describe('The ID of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, resourceId, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new TagResourceCommand({
          ResourceId: resourceId,
          Tags: tags,
      } as any);
      await client.send(command);
      return {
                  message: 'Tags applied successfully',
                  resourceId: resourceId,
              };
    } catch (err) {
      return { error: 'Failed to add tags to an EFS resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
