import { tool } from 'ai';
import { z } from 'zod';
import { CreateHostedZoneCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsCreateRoute53HostedZone = tool({
  description: 'Create a new Route 53 hosted zone. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the domain'),
    callerReference: z.string().describe('Unique identifier'),
    hostedZoneConfig: z.record(z.any()).optional().describe('Hosted zone configuration (Comment, PrivateZone)'),
    delegationSetId: z.string().optional().describe('Delegation set ID'),
    vpc: z.record(z.any()).optional().describe('VPC configuration (VPCRegion, VPCId)'),
  }),
  execute: async ({ awsCredentials, region, name, callerReference, hostedZoneConfig, delegationSetId, vpc }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new CreateHostedZoneCommand({
          Name: name,
          CallerReference: callerReference,
          HostedZoneConfig: hostedZoneConfig,
          DelegationSetId: delegationSetId,
          VPC: vpc,
      });
      const response = await client.send(command);
      return {
                  hostedZone: response.HostedZone,
                  changeInfo: response.ChangeInfo,
                  delegationSet: response.DelegationSet,
                  vpc: response.VPC,
                  location: response.Location,
              };
    } catch (err) {
      return { error: 'Failed to create a new Route 53 hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
