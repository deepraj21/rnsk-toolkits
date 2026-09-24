import { tool } from 'ai';
import { z } from 'zod';
import { StartNotebookInstanceCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStartSagemakerNotebookInstance = tool({
  description: 'Start a SageMaker notebook instance. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    notebookInstanceName: z.string().describe('Name of the notebook instance'),
  }),
  execute: async ({ awsCredentials, region, notebookInstanceName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new StartNotebookInstanceCommand({
          NotebookInstanceName: notebookInstanceName,
      });
      await client.send(command);
      return {
                  message: 'Notebook instance started successfully',
                  notebookInstanceName: notebookInstanceName,
              };
    } catch (err) {
      return { error: 'Failed to start a SageMaker notebook instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
