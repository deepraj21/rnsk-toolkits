import { tool } from 'ai';
import { z } from 'zod';
import { RegisterJobDefinitionCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsRegisterBatchJobDefinition = tool({
  description: 'Register a new Batch job definition. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobDefinitionName: z.string().describe('The name of the job definition'),
    type: z.enum(['container', 'multinode']).describe('The type of job definition (container, multinode)'),
    containerProperties: z.record(z.any()).optional().describe('Container properties for container jobs'),
    nodeProperties: z.record(z.any()).optional().describe('Node properties for multinode jobs'),
    parameters: z.record(z.any()).optional().describe('Default parameters for the job definition'),
    retryStrategy: z.record(z.any()).optional().describe('Retry strategy configuration'),
    timeout: z.record(z.any()).optional().describe('Timeout configuration'),
    tags: z.record(z.any()).optional().describe('Tags as key-value pairs'),
    platformCapabilities: z.array(z.string()).optional().describe('Platform capabilities (EC2, FARGATE, FARGATE_SPOT)'),
    propagateTags: z.boolean().optional().describe('Whether to propagate tags to jobs'),
  }),
  execute: async ({ awsCredentials, region, jobDefinitionName, type, containerProperties, nodeProperties, parameters, retryStrategy, timeout, tags, platformCapabilities, propagateTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new RegisterJobDefinitionCommand({
          jobDefinitionName: jobDefinitionName,
          type: type,
          containerProperties: containerProperties,
          nodeProperties: nodeProperties,
          parameters: parameters,
          retryStrategy: retryStrategy,
          timeout: timeout,
          tags: tags,
          platformCapabilities: platformCapabilities,
          propagateTags: propagateTags,
      } as any);
      const response = await client.send(command);
      return {
                  jobDefinitionName: response.jobDefinitionName,
                  jobDefinitionArn: response.jobDefinitionArn,
                  revision: response.revision,
              };
    } catch (err) {
      return { error: 'Failed to register a new Batch job definition', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
