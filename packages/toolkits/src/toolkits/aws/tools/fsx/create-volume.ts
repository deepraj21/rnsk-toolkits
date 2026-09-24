import { tool } from 'ai';
import { z } from 'zod';
import { CreateVolumeCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsCreateFsxVolume = tool({
  description: 'Create a volume in an ONTAP file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    name: z.string().describe('Name of the volume'),
    ontapConfiguration: z.record(z.any()).optional().describe('ONTAP volume configuration'),
    openZFSConfiguration: z.record(z.any()).optional().describe('OpenZFS volume configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    volumeType: z.enum(['ONTAP', 'OPENZFS']).describe('Volume type (ONTAP, OPENZFS)'),
  }),
  execute: async ({ awsCredentials, region, clientRequestToken, name, ontapConfiguration, openZFSConfiguration, tags, volumeType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CreateVolumeCommand({
          ClientRequestToken: clientRequestToken,
          Name: name,
          OntapConfiguration: ontapConfiguration,
          OpenZFSConfiguration: openZFSConfiguration,
          Tags: tags,
          VolumeType: volumeType,
      } as any);
      const response = await client.send(command);
      return {
                  volume: response.Volume,
              };
    } catch (err) {
      return { error: 'Failed to create a volume in an ONTAP file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
