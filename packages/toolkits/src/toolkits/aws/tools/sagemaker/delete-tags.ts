import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTagsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDeleteSagemakerTags = tool({
  description: 'Remove tags from a SageMaker resource. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the resource'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DeleteTagsCommand({
          ResourceArn: resourceArn,
          TagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  message: 'Tags deleted successfully',
                  resourceArn: resourceArn,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from a SageMaker resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
