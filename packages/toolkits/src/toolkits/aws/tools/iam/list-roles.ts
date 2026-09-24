import { tool } from 'ai';
import { z } from 'zod';
import { ListRolesCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsListIamRoles = tool({
  description: 'List all IAM roles in the AWS account.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxItems: z.number().optional().describe('Maximum number of roles to return (1-1000)'),
    marker: z.string().optional().describe('Pagination marker from previous response'),
    pathPrefix: z.string().optional().describe('Path prefix to filter roles'),
  }),
  execute: async ({ awsCredentials, region, maxItems, marker, pathPrefix }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new ListRolesCommand({
          MaxItems: maxItems,
          Marker: marker,
          PathPrefix: pathPrefix,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all IAM roles in the AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
