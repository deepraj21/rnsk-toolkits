import { tool } from 'ai';
import { z } from 'zod';
import { DeleteStageCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsDeleteStage = tool({
  description: 'Deletes a Stage resource. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    stageName: z.string().describe('The name of the Stage resource'),
  }),
  execute: async ({ awsCredentials, region, restApiId, stageName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new DeleteStageCommand({
          restApiId: restApiId,
          stageName: stageName,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a Stage resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
