import { tool } from 'ai';
import { z } from 'zod';
import { CreateSnapshotCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsCreateFsxSnapshot = tool({
  description: 'Create a snapshot of an FSx volume. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    name: z.string().describe('Name of the snapshot'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    volumeId: z.string().describe('The ID of the volume'),
  }),
  execute: async ({ awsCredentials, region, clientRequestToken, name, tags, volumeId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new CreateSnapshotCommand({
          ClientRequestToken: clientRequestToken,
          Name: name,
          Tags: tags,
          VolumeId: volumeId,
      } as any);
      const response = await client.send(command);
      return {
                  snapshot: response.Snapshot,
              };
    } catch (err) {
      return { error: 'Failed to create a snapshot of an FSx volume', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
