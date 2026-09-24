import { tool } from 'ai';
import { z } from 'zod';
import { AddTagsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsAddSagemakerTags = tool({
  description: 'Add tags to a SageMaker resource. Use it to grant access or attach configuration.',
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
      const client = createSageMakerClient(awsCredentials, region);

      const command = new AddTagsCommand({
          ResourceArn: resourceArn,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
              };
    } catch (err) {
      return { error: 'Failed to add tags to a SageMaker resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
