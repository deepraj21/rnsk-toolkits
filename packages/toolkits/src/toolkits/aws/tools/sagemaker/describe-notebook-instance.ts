import { tool } from 'ai';
import { z } from 'zod';
import { DescribeNotebookInstanceCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerNotebookInstance = tool({
  description: 'Get details about a SageMaker notebook instance. Use it to inspect current state before making changes.',
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

      const command = new DescribeNotebookInstanceCommand({
          NotebookInstanceName: notebookInstanceName,
      });
      const response = await client.send(command);
      return {
                  notebookInstance: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker notebook instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
