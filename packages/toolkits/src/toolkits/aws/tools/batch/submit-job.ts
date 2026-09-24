import { tool } from 'ai';
import { z } from 'zod';
import { SubmitJobCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsSubmitBatchJob = tool({
  description: 'Submit a new Batch job. Use it to submit work.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobName: z.string().describe('The name of the job'),
    jobQueue: z.string().describe('The name of the job queue'),
    jobDefinition: z.string().describe('The name and revision of the job definition'),
    parameters: z.record(z.any()).optional().describe('Job parameters'),
    arrayProperties: z.record(z.any()).optional().describe('Array job properties'),
    dependsOn: z.array(z.record(z.any())).optional().describe('Job dependencies'),
    containerOverrides: z.record(z.any()).optional().describe('Container overrides'),
    nodeOverrides: z.record(z.any()).optional().describe('Node overrides for multinode jobs'),
    retryStrategy: z.record(z.any()).optional().describe('Retry strategy'),
    timeout: z.record(z.any()).optional().describe('Timeout configuration'),
    tags: z.record(z.any()).optional().describe('Tags as key-value pairs'),
    propagateTags: z.boolean().optional().describe('Whether to propagate tags'),
  }),
  execute: async ({ awsCredentials, region, jobName, jobQueue, jobDefinition, parameters, arrayProperties, dependsOn, containerOverrides, nodeOverrides, retryStrategy, timeout, tags, propagateTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new SubmitJobCommand({
          jobName: jobName,
          jobQueue: jobQueue,
          jobDefinition: jobDefinition,
          parameters: parameters,
          arrayProperties: arrayProperties,
          dependsOn: dependsOn,
          containerOverrides: containerOverrides,
          nodeOverrides: nodeOverrides,
          retryStrategy: retryStrategy,
          timeout: timeout,
          tags: tags,
          propagateTags: propagateTags,
      });
      const response = await client.send(command);
      return {
                  jobId: response.jobId,
                  jobName: response.jobName,
                  jobArn: response.jobArn,
              };
    } catch (err) {
      return { error: 'Failed to submit a new Batch job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
