import { tool } from 'ai';
import { z } from 'zod';
import { DetectStackDriftCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDetectCloudformationStackDrift = tool({
  description: 'Detect drift on a CloudFormation stack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('Name of the stack'),
  }),
  execute: async ({ awsCredentials, region, stackName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DetectStackDriftCommand({
          StackName: stackName,
      });
      const response = await client.send(command);
      return { stackDriftDetectionId: response.StackDriftDetectionId };
    } catch (err) {
      return { error: 'Failed to detect drift on a CloudFormation stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
