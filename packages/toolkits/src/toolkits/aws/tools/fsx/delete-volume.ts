import { tool } from 'ai';
import { z } from 'zod';
import { DeleteVolumeCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDeleteFsxVolume = tool({
  description: 'Delete a volume. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    ontapConfiguration: z.record(z.any()).optional().describe('ONTAP-specific deletion options'),
    openZFSConfiguration: z.record(z.any()).optional().describe('OpenZFS-specific deletion options'),
    volumeId: z.string().describe('The ID of the volume to delete'),
  }),
  execute: async ({ awsCredentials, region, clientRequestToken, ontapConfiguration, openZFSConfiguration, volumeId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DeleteVolumeCommand({
          ClientRequestToken: clientRequestToken,
          OntapConfiguration: ontapConfiguration,
          OpenZFSConfiguration: openZFSConfiguration,
          VolumeId: volumeId,
      });
      const response = await client.send(command);
      return {
                  volumeId: response.VolumeId,
                  lifeCycle: response.Lifecycle,
              };
    } catch (err) {
      return { error: 'Failed to delete a volume', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
