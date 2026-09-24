import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAliasCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsDeleteLambdaFunctionAlias = tool({
  description: 'Delete a Lambda function alias. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    name: z.string().describe('The alias name'),
  }),
  execute: async ({ awsCredentials, region, functionName, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new DeleteAliasCommand({
          FunctionName: functionName,
          Name: name,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Alias ${name} deleted successfully from function ${functionName}`,
              };
    } catch (err) {
      return { error: 'Failed to delete a Lambda function alias', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
