import { tool } from 'ai';
import { z } from 'zod';
import { PublishVersionCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsPublishLambdaFunctionVersion = tool({
  description: 'Publish a new version of a Lambda function. Use it to publish or release.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    description: z.string().optional().describe('Version description'),
    codeSha256: z.string().optional().describe('SHA256 hash of the code (optional)'),
  }),
  execute: async ({ awsCredentials, region, functionName, description, codeSha256 }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new PublishVersionCommand({
          FunctionName: functionName,
          Description: description,
          CodeSha256: codeSha256,
      });
      const response = await client.send(command);
      return {
                  functionName: response.FunctionName,
                  functionArn: response.FunctionArn,
                  runtime: response.Runtime,
                  role: response.Role,
                  handler: response.Handler,
                  codeSize: response.CodeSize,
                  description: response.Description,
                  timeout: response.Timeout,
                  memorySize: response.MemorySize,
                  lastModified: response.LastModified,
                  codeSha256: response.CodeSha256,
                  version: response.Version,
                  state: response.State,
              };
    } catch (err) {
      return { error: 'Failed to publish a new version of a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
