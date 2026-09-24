import { tool } from 'ai';
import { z } from 'zod';
import { DescribeExperimentCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerExperiment = tool({
  description: 'Get details about a SageMaker experiment. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    experimentName: z.string().describe('Name of the experiment'),
  }),
  execute: async ({ awsCredentials, region, experimentName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DescribeExperimentCommand({
          ExperimentName: experimentName,
      });
      const response = await client.send(command);
      return {
                  experiment: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker experiment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
