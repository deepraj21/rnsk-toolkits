import { tool } from 'ai';
import { z } from 'zod';
import { StopNotebookInstanceCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStopSagemakerNotebookInstance = tool({
  description: 'Stop a SageMaker notebook instance. Use it to stop a running resource (billable config may remain).',
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

      const command = new StopNotebookInstanceCommand({
          NotebookInstanceName: notebookInstanceName,
      });
      await client.send(command);
      return {
                  message: 'Notebook instance stopped successfully',
                  notebookInstanceName: notebookInstanceName,
              };
    } catch (err) {
      return { error: 'Failed to stop a SageMaker notebook instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
