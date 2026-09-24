import { tool } from 'ai';
import { z } from 'zod';
import { StartSnapshotCommand } from '@aws-sdk/client-ebs';
import { createEbsClient } from '../client.js';

export const awsStartEbsSnapshot = tool({
  description: 'Start creating a new EBS snapshot. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    volumeSize: z.number().describe('The size of the volume, in GiB'),
    parentSnapshotId: z.string().optional().describe('The ID of the parent snapshot (for incremental snapshots)'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the snapshot'),
    properties: z.string().optional().describe('properties'),
    Key: z.string().optional().describe('Key'),
    Value: z.string().optional().describe('Value'),
    description: z.string().optional().describe('Description of the snapshot'),
    encrypted: z.boolean().optional().describe('Whether to encrypt the snapshot'),
    kmsKeyArn: z.string().optional().describe('KMS key ARN for encryption'),
    timeout: z.number().optional().describe('Timeout period in seconds'),
  }),
  execute: async ({ awsCredentials, region, volumeSize, parentSnapshotId, tags, properties, Key, Value, description, encrypted, kmsKeyArn, timeout }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEbsClient(awsCredentials, region);

      const command = new StartSnapshotCommand({
          VolumeSize: volumeSize,
          ParentSnapshotId: parentSnapshotId,
          Tags: tags,
          Description: description,
          Encrypted: encrypted,
          KmsKeyArn: kmsKeyArn,
          Timeout: timeout,
      });
      const response = await client.send(command);
      return {
                  snapshotId: response.SnapshotId,
                  ownerId: response.OwnerId,
                  status: response.Status,
                  startTime: response.StartTime,
                  volumeSize: response.VolumeSize,
                  blockSize: response.BlockSize,
                  tags: response.Tags,
                  description: response.Description,
                  kmsKeyArn: response.KmsKeyArn,
                  sseType: response.SseType,
              };
    } catch (err) {
      return { error: 'Failed to start creating a new EBS snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
