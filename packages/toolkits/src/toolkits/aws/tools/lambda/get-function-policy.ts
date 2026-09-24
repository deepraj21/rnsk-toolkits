import { tool } from 'ai';
import { z } from 'zod';
import { GetPolicyCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsGetLambdaFunctionPolicy = tool({
  description: 'Get the resource-based policy for a Lambda function. Use it to inspect current state before making changes.',
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

      const command = new GetPolicyCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
      });
      const response = await client.send(command);
      return {
                  policy: response.Policy ? JSON.parse(response.Policy) : null,
                  revisionId: response.RevisionId,
              };
    } catch (err) {
      return { error: 'Failed to get the resource-based policy for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
