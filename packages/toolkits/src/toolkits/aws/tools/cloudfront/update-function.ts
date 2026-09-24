import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFunctionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontFunction = tool({
  description: 'Update a CloudFront function. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The function name'),
    functionConfig: z.record(z.any()).describe('Function configuration'),
    functionCode: z.string().describe('Function code (base64 encoded)'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, name, functionConfig, functionCode, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateFunctionCommand({
          Name: name,
          FunctionConfig: functionConfig,
          FunctionCode: Buffer.from(functionCode, 'base64'),
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  functionSummary: response.FunctionSummary,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
