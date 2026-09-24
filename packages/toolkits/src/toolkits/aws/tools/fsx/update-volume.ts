import { tool } from 'ai';
import { z } from 'zod';
import { UpdateVolumeCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsUpdateFsxVolume = tool({
  description: 'Update a volume. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    name: z.string().optional().describe('New name for the volume'),
    ontapConfiguration: z.record(z.any()).optional().describe('ONTAP volume configuration updates'),
    openZFSConfiguration: z.record(z.any()).optional().describe('OpenZFS volume configuration updates'),
    volumeId: z.string().describe('The ID of the volume'),
  }),
  execute: async ({ awsCredentials, region, clientRequestToken, name, ontapConfiguration, openZFSConfiguration, volumeId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new UpdateVolumeCommand({
          ClientRequestToken: clientRequestToken,
          Name: name,
          OntapConfiguration: ontapConfiguration,
          OpenZFSConfiguration: openZFSConfiguration,
          VolumeId: volumeId,
      });
      const response = await client.send(command);
      return {
                  volume: response.Volume,
              };
    } catch (err) {
      return { error: 'Failed to update a volume', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
