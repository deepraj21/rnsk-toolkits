import { tool } from 'ai';
import { z } from 'zod';
import { ListAliasesCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaFunctionAliases = tool({
  description: 'List all aliases for a Lambda function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    functionVersion: z.string().optional().describe('Filter by function version (optional)'),
    marker: z.string().optional().describe('Pagination token'),
    maxItems: z.number().optional().describe('Maximum number of aliases to return'),
  }),
  execute: async ({ awsCredentials, region, functionName, functionVersion, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListAliasesCommand({
          FunctionName: functionName,
          FunctionVersion: functionVersion,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  aliases: response.Aliases?.map((a: any) => ({
                      aliasArn: a.AliasArn,
                      name: a.Name,
                      functionVersion: a.FunctionVersion,
                      description: a.Description,
                      revisionId: a.RevisionId,
                      routingConfig: a.RoutingConfig,
                  })) || [],
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list all aliases for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
