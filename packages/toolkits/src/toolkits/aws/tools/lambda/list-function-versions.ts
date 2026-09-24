import { tool } from 'ai';
import { z } from 'zod';
import { ListVersionsByFunctionCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaFunctionVersions = tool({
  description: 'List all versions of a Lambda function.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    marker: z.string().optional().describe('Pagination token'),
    maxItems: z.number().optional().describe('Maximum number of versions to return'),
  }),
  execute: async ({ awsCredentials, region, functionName, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListVersionsByFunctionCommand({
          FunctionName: functionName,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  versions: response.Versions?.map((v: any) => ({
                      functionName: v.FunctionName,
                      functionArn: v.FunctionArn,
                      runtime: v.Runtime,
                      role: v.Role,
                      handler: v.Handler,
                      codeSize: v.CodeSize,
                      description: v.Description,
                      timeout: v.Timeout,
                      memorySize: v.MemorySize,
                      lastModified: v.LastModified,
                      codeSha256: v.CodeSha256,
                      version: v.Version,
                      vpcConfig: v.VpcConfig,
                      environment: v.Environment,
                  })) || [],
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list all versions of a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
