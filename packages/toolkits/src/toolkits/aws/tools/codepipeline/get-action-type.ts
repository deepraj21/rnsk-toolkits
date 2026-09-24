import { tool } from 'ai';
import { z } from 'zod';
import { GetActionTypeCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsGetCodepipelineActionType = tool({
  description: 'Get details about an action type. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    category: z.enum(['Source', 'Build', 'Deploy', 'Test', 'Invoke', 'Approval']).describe('Action category'),
    owner: z.enum(['AWS', 'ThirdParty', 'Custom']).describe('Action owner'),
    provider: z.string().describe('Action provider'),
    version: z.string().describe('Action version'),
  }),
  execute: async ({ awsCredentials, region, category, owner, provider, version }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new GetActionTypeCommand({
          category: category,
          owner: owner,
          provider: provider,
          version: version,
      });
      const response = await client.send(command);
      return {
                  actionType: response.actionType,
              };
    } catch (err) {
      return { error: 'Failed to get details about an action type', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
