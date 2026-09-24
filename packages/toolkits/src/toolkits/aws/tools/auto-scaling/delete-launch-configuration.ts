import { tool } from 'ai';
import { z } from 'zod';
import { DeleteLaunchConfigurationCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDeleteLaunchConfiguration = tool({
  description: 'Delete a launch configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    launchConfigurationName: z.string().describe('The name of the launch configuration'),
  }),
  execute: async ({ awsCredentials, region, launchConfigurationName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DeleteLaunchConfigurationCommand({
          LaunchConfigurationName: launchConfigurationName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Launch configuration ${launchConfigurationName} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a launch configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
