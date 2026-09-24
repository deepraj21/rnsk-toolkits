import { tool } from 'ai';
import { z } from 'zod';
import { GetPolicyVersionCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsGetPolicyVersion = tool({
  description: 'Get the content of a specific policy version. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    policyArn: z.string().describe('ARN of the policy'),
    versionId: z.string().describe('Version ID (e.g., v1, v2)'),
  }),
  execute: async ({ awsCredentials, region, policyArn, versionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new GetPolicyVersionCommand({
          PolicyArn: policyArn,
          VersionId: versionId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get the content of a specific policy version', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
