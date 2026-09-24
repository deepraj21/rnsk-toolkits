import { tool } from 'ai';
import { z } from 'zod';
import { ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaFunctions = tool({
  description: 'List all Lambda functions in your AWS account.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Pagination token to retrieve next set of functions'),
    maxItems: z.number().optional().describe('Maximum number of functions to return'),
    functionVersion: z.string().optional().describe('Filter by function version (ALL, CURRENT)'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems, functionVersion }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListFunctionsCommand({
          Marker: marker,
          MaxItems: maxItems,
          FunctionVersion: functionVersion as any,
      });
      const response = await client.send(command);
      return {
                  functions: response.Functions?.map((f: any) => ({
                      functionName: f.FunctionName,
                      functionArn: f.FunctionArn,
                      runtime: f.Runtime,
                      role: f.Role,
                      handler: f.Handler,
                      codeSize: f.CodeSize,
                      description: f.Description,
                      timeout: f.Timeout,
                      memorySize: f.MemorySize,
                      lastModified: f.LastModified,
                      codeSha256: f.CodeSha256,
                      version: f.Version,
                      vpcConfig: f.VpcConfig,
                      environment: f.Environment,
                      kmsKeyArn: f.KMSKeyArn,
                      masterArn: f.MasterArn,
                      revisionId: f.RevisionId,
                      layers: f.Layers?.map((l: any) => ({
                          arn: l.Arn,
                          codeSize: l.CodeSize,
                      })) || [],
                  })),
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list all Lambda functions in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
