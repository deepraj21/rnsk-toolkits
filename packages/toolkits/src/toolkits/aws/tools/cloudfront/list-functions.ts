import { tool } from 'ai';
import { z } from 'zod';
import { ListFunctionsCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsListCloudfrontFunctions = tool({
  description: 'List all CloudFront functions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of functions to return'),
    stage: z.enum(['DEVELOPMENT', 'LIVE']).optional().describe('Function stage'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems, stage }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new ListFunctionsCommand({
          Marker: marker,
          MaxItems: maxItems,
          Stage: stage as any,
      });
      const response = await client.send(command);
      return {
                  functionList: response.FunctionList,
              };
    } catch (err) {
      return { error: 'Failed to list all CloudFront functions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
