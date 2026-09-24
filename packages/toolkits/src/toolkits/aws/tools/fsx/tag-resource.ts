import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsTagFsxResource = tool({
  description: 'Add tags to an FSx resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceARN: z.string().describe('The ARN of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, resourceARN, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new TagResourceCommand({
          ResourceARN: resourceARN,
          Tags: tags,
      } as any);
      await client.send(command);
      return {
                  success: true,
                  message: `Tags added successfully to resource ${resourceARN}`,
              };
    } catch (err) {
      return { error: 'Failed to add tags to an FSx resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
