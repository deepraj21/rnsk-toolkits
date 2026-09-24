import { tool } from 'ai';
import { z } from 'zod';
import { ListApplicationRevisionsCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsListCodedeployApplicationRevisions = tool({
  description: 'List application revisions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    sortBy: z.enum(['registerTime', 'firstUsedTime', 'lastUsedTime']).optional().describe('Sort order'),
    sortOrder: z.enum(['ascending', 'descending']).optional().describe('Sort order'),
    s3Bucket: z.string().optional().describe('S3 bucket name to filter by'),
    s3KeyPrefix: z.string().optional().describe('S3 key prefix to filter by'),
    deployed: z.enum(['include', 'exclude', 'ignore']).optional().describe('Whether to include deployed revisions'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, applicationName, sortBy, sortOrder, s3Bucket, s3KeyPrefix, deployed, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new ListApplicationRevisionsCommand({
          applicationName: applicationName,
          sortBy: sortBy,
          sortOrder: sortOrder,
          s3Bucket: s3Bucket,
          s3KeyPrefix: s3KeyPrefix,
          deployed: deployed,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  revisions: response.revisions || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list application revisions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
