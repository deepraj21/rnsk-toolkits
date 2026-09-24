import { tool } from 'ai';
import { z } from 'zod';
import { CreateFunctionCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsCreateLambdaFunction = tool({
  description: 'Create a new Lambda function.. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    runtime: z.string().describe('Runtime identifier (e.g., nodejs20.x, python3.12)'),
    role: z.string().describe('IAM role ARN for the function'),
    handler: z.string().describe('Function handler name'),
    code: z.record(z.any()).describe('Function code (ZipFile base64 or S3Bucket/S3Key)'),
    description: z.string().optional().describe('Function description'),
    timeout: z.number().optional().describe('Function timeout in seconds'),
    memorySize: z.number().optional().describe('Memory size in MB'),
    environment: z.record(z.any()).optional().describe('Environment variables'),
    tags: z.record(z.any()).optional().describe('Tags as key-value pairs'),
  }),
  execute: async ({ awsCredentials, region, functionName, runtime, role, handler, code, description, timeout, memorySize, environment, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new CreateFunctionCommand({
          FunctionName: functionName,
          Runtime: runtime,
          Role: role,
          Handler: handler,
          Code: code,
          Description: description,
          Timeout: timeout,
          MemorySize: memorySize,
          Environment: environment ? { Variables: environment } : undefined,
          Tags: tags,
      } as any);
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
                  stateReason: response.StateReason,
                  stateReasonCode: response.StateReasonCode,
                  lastUpdateStatus: response.LastUpdateStatus,
              };
    } catch (err) {
      return { error: 'Failed to create a new Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
