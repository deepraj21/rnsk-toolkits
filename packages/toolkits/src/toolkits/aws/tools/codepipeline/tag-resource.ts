import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsTagCodepipelineResource = tool({
  description: 'Add tags to a CodePipeline resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new TagResourceCommand({
          resourceArn: resourceArn,
          tags: tags,
      } as any);
      await client.send(command);
      return {
                  message: 'Tags applied successfully',
                  resourceArn: resourceArn,
              };
    } catch (err) {
      return { error: 'Failed to add tags to a CodePipeline resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
