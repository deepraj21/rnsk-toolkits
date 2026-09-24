import { tool } from 'ai';
import { z } from 'zod';
import { GetFunctionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsGetCloudfrontFunction = tool({
  description: 'Get information about a CloudFront function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The function name'),
    stage: z.enum(['DEVELOPMENT', 'LIVE']).describe('Function stage'),
  }),
  execute: async ({ awsCredentials, region, name, stage }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new GetFunctionCommand({
          Name: name,
          Stage: stage as any,
      });
      const response = await client.send(command);
      return {
                  functionCode: response.FunctionCode ? Buffer.from(response.FunctionCode).toString('base64') : undefined,
                  eTag: response.ETag,
                  contentType: response.ContentType,
              };
    } catch (err) {
      return { error: 'Failed to get information about a CloudFront function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
