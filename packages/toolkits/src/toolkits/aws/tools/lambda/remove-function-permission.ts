import { tool } from 'ai';
import { z } from 'zod';
import { RemovePermissionCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsRemoveLambdaFunctionPermission = tool({
  description: 'Remove a permission from a Lambda function resource-based policy. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    statementId: z.string().describe('Statement identifier to remove'),
    qualifier: z.string().optional().describe('Version or alias qualifier (optional)'),
  }),
  execute: async ({ awsCredentials, region, functionName, statementId, qualifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new RemovePermissionCommand({
          FunctionName: functionName,
          StatementId: statementId,
          Qualifier: qualifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Permission ${statementId} removed successfully from function ${functionName}`,
              };
    } catch (err) {
      return { error: 'Failed to remove a permission from a Lambda function resource-based policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
