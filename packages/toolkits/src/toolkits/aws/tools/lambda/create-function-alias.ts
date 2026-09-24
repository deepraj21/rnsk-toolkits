import { tool } from 'ai';
import { z } from 'zod';
import { CreateAliasCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsCreateLambdaFunctionAlias = tool({
  description: 'Create an alias for a Lambda function. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    name: z.string().describe('The alias name'),
    functionVersion: z.string().describe('The function version the alias points to'),
    description: z.string().optional().describe('Alias description'),
  }),
  execute: async ({ awsCredentials, region, functionName, name, functionVersion, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new CreateAliasCommand({
          FunctionName: functionName,
          Name: name,
          FunctionVersion: functionVersion,
          Description: description,
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
      return { error: 'Failed to create an alias for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
