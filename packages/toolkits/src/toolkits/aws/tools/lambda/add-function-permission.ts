import { tool } from 'ai';
import { z } from 'zod';
import { AddPermissionCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsAddLambdaFunctionPermission = tool({
  description: 'Add a permission to a Lambda function resource-based policy. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    statementId: z.string().describe('Unique statement identifier'),
    action: z.string().describe('Lambda action (e.g., lambda:InvokeFunction)'),
    principal: z.string().describe('Principal (service, account, ARN)'),
    sourceArn: z.string().optional().describe('Source ARN (optional)'),
    sourceAccount: z.string().optional().describe('Source account (optional)'),
    qualifier: z.string().optional().describe('Version or alias qualifier (optional)'),
  }),
  execute: async ({ awsCredentials, region, functionName, statementId, action, principal, sourceArn, sourceAccount, qualifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new AddPermissionCommand({
          FunctionName: functionName,
          StatementId: statementId,
          Action: action,
          Principal: principal,
          SourceArn: sourceArn,
          SourceAccount: sourceAccount,
          Qualifier: qualifier,
      });
      const response = await client.send(command);
      return {
                  statement: response.Statement,
              };
    } catch (err) {
      return { error: 'Failed to add a permission to a Lambda function resource-based policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
