import { tool } from 'ai';
import { z } from 'zod';
import { DeleteFunctionUrlConfigCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsDeleteLambdaFunctionUrlConfig = tool({
  description: 'Delete function URL configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    qualifier: z.string().optional().describe('Version or alias qualifier (optional)'),
  }),
  execute: async ({ awsCredentials, region, functionName, qualifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new DeleteFunctionUrlConfigCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Function URL config deleted successfully for function ${functionName}`,
              };
    } catch (err) {
      return { error: 'Failed to delete function URL configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
