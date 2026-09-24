import { tool } from 'ai';
import { z } from 'zod';
import { GetFunctionConfigurationCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsGetLambdaFunctionConfiguration = tool({
  description: 'Get configuration details of a Lambda function. Use it to inspect current state before making changes.',
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

      const command = new GetFunctionConfigurationCommand({
          FunctionName: functionName,
          Qualifier: qualifier,
      });
      const response = await client.send(command);
      return {
                  functionName: response.FunctionName,
                  functionArn: response.FunctionArn,
                  runtime: response.Runtime,
                  role: response.Role,
                  handler: response.Handler,
                  codeSize: response.CodeSize,
                  description: response.Description,
                  timeout: response.Timeout,
                  memorySize: response.MemorySize,
                  lastModified: response.LastModified,
                  codeSha256: response.CodeSha256,
                  version: response.Version,
                  vpcConfig: response.VpcConfig,
                  environment: response.Environment,
                  kmsKeyArn: response.KMSKeyArn,
                  masterArn: response.MasterArn,
                  revisionId: response.RevisionId,
                  layers: response.Layers?.map((l: any) => ({
                      arn: l.Arn,
                      codeSize: l.CodeSize,
                  })) || [],
                  state: response.State,
                  stateReason: response.StateReason,
                  stateReasonCode: response.StateReasonCode,
                  lastUpdateStatus: response.LastUpdateStatus,
                  lastUpdateStatusReason: response.LastUpdateStatusReason,
                  lastUpdateStatusReasonCode: response.LastUpdateStatusReasonCode,
                  packageType: response.PackageType,
                  deadLetterConfig: response.DeadLetterConfig,
                  tracingConfig: response.TracingConfig,
                  architectures: response.Architectures,
                  ephemeralStorage: response.EphemeralStorage,
              };
    } catch (err) {
      return { error: 'Failed to get configuration details of a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
