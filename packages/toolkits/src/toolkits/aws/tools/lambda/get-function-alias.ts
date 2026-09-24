import { tool } from 'ai';
import { z } from 'zod';
import { GetAliasCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsGetLambdaFunctionAlias = tool({
  description: 'Get details about a Lambda function alias. Use it to inspect current state before making changes.',
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

      const command = new GetAliasCommand({
          FunctionName: functionName,
          Name: name,
      });
      const response = await client.send(command);
      return {
                  aliasArn: response.AliasArn,
                  name: response.Name,
                  functionVersion: response.FunctionVersion,
                  description: response.Description,
                  revisionId: response.RevisionId,
                  routingConfig: response.RoutingConfig,
              };
    } catch (err) {
      return { error: 'Failed to get details about a Lambda function alias', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
