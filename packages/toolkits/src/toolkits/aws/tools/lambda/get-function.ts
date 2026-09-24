import { tool } from 'ai';
import { z } from 'zod';
import { GetFunctionCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsGetLambdaFunction = tool({
  description: 'Get details about a Lambda function including code location.. Use it to inspect current state before making changes.',
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

      const command = new GetFunctionCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
      });
      const response = await client.send(command);
      return {
                  configuration: response.Configuration ? {
                      functionName: response.Configuration.FunctionName,
                      functionArn: response.Configuration.FunctionArn,
                      runtime: response.Configuration.Runtime,
                      role: response.Configuration.Role,
                      handler: response.Configuration.Handler,
                      codeSize: response.Configuration.CodeSize,
                      description: response.Configuration.Description,
                      timeout: response.Configuration.Timeout,
                      memorySize: response.Configuration.MemorySize,
                      lastModified: response.Configuration.LastModified,
                      codeSha256: response.Configuration.CodeSha256,
                      version: response.Configuration.Version,
                      vpcConfig: response.Configuration.VpcConfig,
                      environment: response.Configuration.Environment,
                      kmsKeyArn: response.Configuration.KMSKeyArn,
                      masterArn: response.Configuration.MasterArn,
                      revisionId: response.Configuration.RevisionId,
                      layers: response.Configuration.Layers?.map((l: any) => ({
                          arn: l.Arn,
                          codeSize: l.CodeSize,
                      })) || [],
                  } : null,
                  code: response.Code ? {
                      repositoryType: response.Code.RepositoryType,
                      location: response.Code.Location,
                      imageUri: response.Code.ImageUri,
                      resolvedImageUri: response.Code.ResolvedImageUri,
                  } : null,
                  tags: response.Tags || {},
              };
    } catch (err) {
      return { error: 'Failed to get details about a Lambda function including code location', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
