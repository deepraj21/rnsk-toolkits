import { tool } from 'ai';
import { z } from 'zod';
import { CreatePolicyVersionCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsCreatePolicyVersion = tool({
  description: 'Create a new version of a customer managed policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    policyArn: z.string().describe('ARN of the policy'),
    policyDocument: z.string().describe('New JSON policy document'),
    setAsDefault: z.boolean().optional().describe('Set this version as the default'),
  }),
  execute: async ({ awsCredentials, region, policyArn, policyDocument, setAsDefault }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new CreatePolicyVersionCommand({
          PolicyArn: policyArn,
          PolicyDocument: policyDocument,
          SetAsDefault: setAsDefault,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new version of a customer managed policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
