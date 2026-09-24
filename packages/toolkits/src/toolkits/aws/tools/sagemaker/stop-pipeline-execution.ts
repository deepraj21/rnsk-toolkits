import { tool } from 'ai';
import { z } from 'zod';
import { StopPipelineExecutionCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStopSagemakerPipelineExecution = tool({
  description: 'Stop a SageMaker pipeline execution. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineExecutionArn: z.string().describe('ARN of the pipeline execution'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
  }),
  execute: async ({ awsCredentials, region, pipelineExecutionArn, clientRequestToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new StopPipelineExecutionCommand({
          PipelineExecutionArn: pipelineExecutionArn,
          ClientRequestToken: clientRequestToken,
      });
      const response = await client.send(command);
      return {
                  pipelineExecutionArn: response.PipelineExecutionArn,
              };
    } catch (err) {
      return { error: 'Failed to stop a SageMaker pipeline execution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
