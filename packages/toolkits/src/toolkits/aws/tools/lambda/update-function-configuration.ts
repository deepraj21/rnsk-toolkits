import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFunctionConfigurationCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsUpdateLambdaFunctionConfiguration = tool({
  description: 'Update configuration settings of a Lambda function.. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    role: z.string().optional().describe('IAM role ARN for the function'),
    handler: z.string().optional().describe('Function handler name'),
    description: z.string().optional().describe('Function description'),
    timeout: z.number().optional().describe('Function timeout in seconds'),
    memorySize: z.number().optional().describe('Memory size in MB'),
    environment: z.record(z.any()).optional().describe('Environment variables'),
    runtime: z.string().optional().describe('Runtime identifier'),
  }),
  execute: async ({ awsCredentials, region, functionName, role, handler, description, timeout, memorySize, environment, runtime }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new UpdateFunctionConfigurationCommand({
          FunctionName: functionName,
          Role: role,
          Handler: handler,
          Description: description,
          Timeout: timeout,
          MemorySize: memorySize,
          Environment: environment ? { Variables: environment } : undefined,
          Runtime: runtime,
      } as any);
      const response = await client.send(command);
      return {
                  functionName: response.FunctionName,
                  functionArn: response.FunctionArn,
                  runtime: response.Runtime,
                  role: response.Role,
                  handler: response.Handler,
                  description: response.Description,
                  timeout: response.Timeout,
                  memorySize: response.MemorySize,
                  lastModified: response.LastModified,
                  codeSha256: response.CodeSha256,
                  version: response.Version,
                  environment: response.Environment,
                  revisionId: response.RevisionId,
              };
    } catch (err) {
      return { error: 'Failed to update configuration settings of a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
