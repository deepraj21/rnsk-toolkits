import { tool } from 'ai';
import { z } from 'zod';
import { DetectStackResourceDriftCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDetectCloudformationStackResourceDrift = tool({
  description: 'Detect drift on a specific resource in a stack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('Name of the stack'),
    logicalResourceId: z.string().describe('Logical ID of the resource'),
  }),
  execute: async ({ awsCredentials, region, stackName, logicalResourceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DetectStackResourceDriftCommand({
          StackName: stackName,
          LogicalResourceId: logicalResourceId,
      });
      const response = await client.send(command);
      return { stackResourceDrift: response.StackResourceDrift };
    } catch (err) {
      return { error: 'Failed to detect drift on a specific resource in a stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
