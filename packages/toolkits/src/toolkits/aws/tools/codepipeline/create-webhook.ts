import { tool } from 'ai';
import { z } from 'zod';
import { PutWebhookCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsCreateCodepipelineWebhook = tool({
  description: 'Create a webhook for a CodePipeline pipeline. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    webhook: z.enum(['GITHUB_HMAC', 'IP', 'UNAUTHENTICATED']).describe('Webhook configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, webhook, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new PutWebhookCommand({
          webhook: webhook,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  webhook: response.webhook,
              };
    } catch (err) {
      return { error: 'Failed to create a webhook for a CodePipeline pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
