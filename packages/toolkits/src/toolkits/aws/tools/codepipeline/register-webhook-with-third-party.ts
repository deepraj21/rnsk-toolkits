import { tool } from 'ai';
import { z } from 'zod';
import { RegisterWebhookWithThirdPartyCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsRegisterCodepipelineWebhookWithThirdParty = tool({
  description: 'Register a webhook with a third party. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    webhookName: z.string().describe('Name of the webhook'),
  }),
  execute: async ({ awsCredentials, region, webhookName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new RegisterWebhookWithThirdPartyCommand({
          webhookName: webhookName,
      });
      await client.send(command);
      return {
                  message: 'Webhook registered successfully',
                  webhookName: webhookName,
              };
    } catch (err) {
      return { error: 'Failed to register a webhook with a third party', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
