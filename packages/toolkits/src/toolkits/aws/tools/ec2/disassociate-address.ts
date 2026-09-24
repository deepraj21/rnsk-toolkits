import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateAddressCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDisassociateEc2Address = tool({
  description: 'Disassociate an Elastic IP from an instance. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    associationId: z.string().describe('Association ID'),
  }),
  execute: async ({ awsCredentials, region, associationId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DisassociateAddressCommand({ AssociationId: associationId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to disassociate an Elastic IP from an instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
