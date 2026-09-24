import { tool } from 'ai';
import { z } from 'zod';
import { CreateProtectionCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsCreateProtection = tool({
  description: 'Create protection for a resource (requires Shield Advanced). Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name for the protection'),
    resourceArn: z.string().describe('ARN of the resource to protect (CloudFront, Route 53, ELB, EIP, Global Accelerator)'),
    tags: z.array(z.record(z.any())).optional().describe('Tags for the protection'),
  }),
  execute: async ({ awsCredentials, region, name, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new CreateProtectionCommand({
          Name: name,
          ResourceArn: resourceArn,
          Tags: tags,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create protection for a resource (requires Shield Advanced)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
