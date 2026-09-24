import { tool } from 'ai';
import { z } from 'zod';
import { CreateFunctionUrlConfigCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsCreateLambdaFunctionUrlConfig = tool({
  description: 'Create a function URL for a Lambda function. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    qualifier: z.string().optional().describe('Version or alias qualifier (optional)'),
    authType: z.string().describe('Authentication type: AWS_IAM or NONE'),
    cors: z.record(z.any()).optional().describe('CORS configuration (optional)'),
  }),
  execute: async ({ awsCredentials, region, functionName, qualifier, authType, cors }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new CreateFunctionUrlConfigCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
          AuthType: authType as any,
          Cors: cors,
      });
      const response = await client.send(command);
      return {
                  functionUrl: response.FunctionUrl,
                  functionArn: response.FunctionArn,
                  authType: response.AuthType,
                  cors: response.Cors,
                  creationTime: response.CreationTime,
              };
    } catch (err) {
      return { error: 'Failed to create a function URL for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
