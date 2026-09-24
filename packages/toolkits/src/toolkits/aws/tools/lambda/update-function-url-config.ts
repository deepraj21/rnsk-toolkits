import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFunctionUrlConfigCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsUpdateLambdaFunctionUrlConfig = tool({
  description: 'Update function URL configuration. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    qualifier: z.string().optional().describe('Version or alias qualifier (optional)'),
    authType: z.string().optional().describe('Authentication type: AWS_IAM or NONE'),
    cors: z.record(z.any()).optional().describe('CORS configuration (optional)'),
  }),
  execute: async ({ awsCredentials, region, functionName, qualifier, authType, cors }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new UpdateFunctionUrlConfigCommand({
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
                  lastModifiedTime: response.LastModifiedTime,
              };
    } catch (err) {
      return { error: 'Failed to update function URL configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
