import { tool } from 'ai';
import { z } from 'zod';
import { CreateServiceCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeService = tool({
  description: 'Create a new VPC Lattice service. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the service'),
    authType: z.enum(['NONE', 'AWS_IAM']).describe('Authentication type'),
    certificateArn: z.string().optional().describe('Certificate ARN'),
    customDomainName: z.string().optional().describe('Custom domain name'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, name, authType, certificateArn, customDomainName, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateServiceCommand({
          name: name,
          authType: authType,
          certificateArn: certificateArn,
          customDomainName: customDomainName,
          tags: tags,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  authType: response.authType,
                  certificateArn: response.certificateArn,
                  customDomainName: response.customDomainName,
                  dnsEntry: response.dnsEntry,
                  id: response.id,
                  name: response.name,
              };
    } catch (err) {
      return { error: 'Failed to create a new VPC Lattice service', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
