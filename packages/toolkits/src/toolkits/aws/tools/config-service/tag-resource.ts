import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsTagConfigResource = tool({
  description: 'Add tags to a Config resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new TagResourceCommand({
          ResourceArn: resourceArn,
          Tags: tags,
      });
      await client.send(command);
      return {
                  message: 'Tags added successfully',
                  resourceArn: resourceArn,
              };
    } catch (err) {
      return { error: 'Failed to add tags to a Config resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
