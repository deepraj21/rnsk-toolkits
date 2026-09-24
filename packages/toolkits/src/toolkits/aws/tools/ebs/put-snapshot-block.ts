import { tool } from 'ai';
import { z } from 'zod';
import { PutSnapshotBlockCommand } from '@aws-sdk/client-ebs';
import { createEbsClient } from '../client.js';

export const awsPutEbsSnapshotBlock = tool({
  description: 'Write a block of data to a snapshot. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotId: z.string().describe('The ID of the snapshot'),
    blockIndex: z.number().describe('The block index (0-based)'),
    blockData: z.string().describe('Base64-encoded block data'),
    dataLength: z.number().describe('The length of the data in bytes'),
    checksum: z.string().describe('SHA256 checksum of the block data'),
    checksumAlgorithm: z.enum(['SHA256']).describe('Checksum algorithm (SHA256)'),
    progress: z.number().optional().describe('Progress of the snapshot (0-100)'),
  }),
  execute: async ({ awsCredentials, region, snapshotId, blockIndex, blockData, dataLength, checksum, checksumAlgorithm, progress }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEbsClient(awsCredentials, region);

      // Convert base64 string to Uint8Array
      const blockBytes = Buffer.from(blockData, 'base64');
      
      const command = new PutSnapshotBlockCommand({
          SnapshotId: snapshotId,
          BlockIndex: blockIndex,
          BlockData: blockBytes,
          DataLength: dataLength,
          Checksum: checksum,
          ChecksumAlgorithm: checksumAlgorithm,
          Progress: progress,
      });
      const response = await client.send(command);
      return {
                  checksum: response.Checksum,
                  checksumAlgorithm: response.ChecksumAlgorithm,
              };
    } catch (err) {
      return { error: 'Failed to write a block of data to a snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
