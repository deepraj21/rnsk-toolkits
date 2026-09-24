import { tool } from 'ai';
import { z } from 'zod';
import { CreateRoleCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsCreateIamRole = tool({
  description: 'Create a new IAM role with a trust policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    roleName: z.string().describe('Name of the IAM role to create'),
    assumeRolePolicyDocument: z.string().describe('JSON trust policy document that grants entities permission to assume the role'),
    description: z.string().optional().describe('Description of the role'),
    path: z.string().optional().describe('Path for the role'),
    maxSessionDuration: z.number().optional().describe('Maximum session duration in seconds (3600-43200)'),
  }),
  execute: async ({ awsCredentials, region, roleName, assumeRolePolicyDocument, description, path, maxSessionDuration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new CreateRoleCommand({
          RoleName: roleName,
          AssumeRolePolicyDocument: assumeRolePolicyDocument,
          Description: description,
          Path: path,
          MaxSessionDuration: maxSessionDuration,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new IAM role with a trust policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
