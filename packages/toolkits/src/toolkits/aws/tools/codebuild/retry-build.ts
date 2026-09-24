import { tool } from 'ai';
import { z } from 'zod';
import { RetryBuildCommand } from '@aws-sdk/client-codebuild';
import { createCodeBuildClient } from '../client.js';

export const awsRetryCodebuildBuild = tool({
  description: 'Restart a build. Use it to retry a failed operation.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('Specifies the identifier of the build to restart'),
    idempotencyToken: z.string().optional().describe('A unique, case sensitive identifier'),
  }),
  execute: async ({ awsCredentials, region, id, idempotencyToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeBuildClient(awsCredentials, region);

      const command = new RetryBuildCommand({
          id: id,
          idempotencyToken: idempotencyToken,
      });
      const response = await client.send(command);
      return {
                  build: response.build,
              };
    } catch (err) {
      return { error: 'Failed to restart a build', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
