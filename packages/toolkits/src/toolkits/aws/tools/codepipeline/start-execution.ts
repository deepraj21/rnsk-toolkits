import { tool } from 'ai';
import { z } from 'zod';
import { StartPipelineExecutionCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsStartCodepipelineExecution = tool({
  description: 'Start a new pipeline execution. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the pipeline'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    variables: z.array(z.record(z.any())).optional().describe('Pipeline execution variables'),
  }),
  execute: async ({ awsCredentials, region, name, clientRequestToken, variables }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new StartPipelineExecutionCommand({
          name: name,
          clientRequestToken: clientRequestToken,
          variables: variables,
      } as any);
      const response = await client.send(command);
      return {
                  pipelineExecutionId: response.pipelineExecutionId,
              };
    } catch (err) {
      return { error: 'Failed to start a new pipeline execution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
