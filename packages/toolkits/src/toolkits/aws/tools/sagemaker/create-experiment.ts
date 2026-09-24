import { tool } from 'ai';
import { z } from 'zod';
import { CreateExperimentCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerExperiment = tool({
  description: 'Create a SageMaker experiment. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    experimentName: z.string().describe('Name of the experiment'),
    displayName: z.string().optional().describe('Display name'),
    description: z.string().optional().describe('Description'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, experimentName, displayName, description, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateExperimentCommand({
          ExperimentName: experimentName,
          DisplayName: displayName,
          Description: description,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  experimentArn: response.ExperimentArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker experiment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
