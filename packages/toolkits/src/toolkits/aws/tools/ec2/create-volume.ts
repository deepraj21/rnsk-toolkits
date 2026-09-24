import { tool } from 'ai';
import { z } from 'zod';
import { CreateVolumeCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2Volume = tool({
  description: 'Create an EBS volume. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    availabilityZone: z.string().describe('Availability zone'),
    size: z.number().optional().describe('Size in GiB'),
    volumeType: z.string().optional().describe('Volume type (gp2, gp3, io1, io2, etc.)'),
    iops: z.number().optional().describe('IOPS for io1/io2 volumes'),
    encrypted: z.boolean().optional().describe('Whether to encrypt the volume'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
  }),
  execute: async ({ awsCredentials, region, availabilityZone, size, volumeType, iops, encrypted, kmsKeyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateVolumeCommand({
          AvailabilityZone: availabilityZone,
          Size: size,
          VolumeType: volumeType as any,
          Iops: iops,
          Encrypted: encrypted,
          KmsKeyId: kmsKeyId,
      });
      const response = await client.send(command);
      return { volumeId: response.VolumeId };
    } catch (err) {
      return { error: 'Failed to create an EBS volume', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
