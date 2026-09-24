import { tool } from 'ai';
import { z } from 'zod';
import { CreatePolicyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsCreateIamPolicy = tool({
  description: 'Create a new customer managed policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    policyName: z.string().describe('Name of the policy to create'),
    policyDocument: z.string().describe('JSON policy document'),
    description: z.string().optional().describe('Description of the policy'),
    path: z.string().optional().describe('Path for the policy'),
  }),
  execute: async ({ awsCredentials, region, policyName, policyDocument, description, path }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new CreatePolicyCommand({
          PolicyName: policyName,
          PolicyDocument: policyDocument,
          Description: description,
          Path: path,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new customer managed policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
