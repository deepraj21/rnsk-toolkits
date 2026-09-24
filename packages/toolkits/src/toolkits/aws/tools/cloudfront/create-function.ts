import { tool } from 'ai';
import { z } from 'zod';
import { CreateFunctionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontFunction = tool({
  description: 'Create a CloudFront function. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The function name'),
    functionConfig: z.record(z.any()).describe('Function configuration'),
    functionCode: z.string().describe('Function code (base64 encoded)'),
  }),
  execute: async ({ awsCredentials, region, name, functionConfig, functionCode }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateFunctionCommand({
          Name: name,
          FunctionConfig: functionConfig,
          FunctionCode: Buffer.from(functionCode, 'base64'),
      } as any);
      const response = await client.send(command);
      return {
                  functionSummary: response.FunctionSummary,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
