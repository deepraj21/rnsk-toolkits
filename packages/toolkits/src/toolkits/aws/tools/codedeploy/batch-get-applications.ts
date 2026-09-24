import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetApplicationsCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsBatchGetCodedeployApplications = tool({
  description: 'Get information about one or more applications. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationNames: z.array(z.string()).describe('The names of the applications'),
  }),
  execute: async ({ awsCredentials, region, applicationNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new BatchGetApplicationsCommand({
          applicationNames: applicationNames,
      });
      const response = await client.send(command);
      return {
                  applicationsInfo: response.applicationsInfo || [],
              };
    } catch (err) {
      return { error: 'Failed to get information about one or more applications', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
