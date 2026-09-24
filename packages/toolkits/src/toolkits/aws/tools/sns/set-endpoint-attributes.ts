import { tool } from 'ai';
import { z } from 'zod';
import { SetEndpointAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsSetSnsEndpointAttributes = tool({
  description: 'Set attributes of a platform endpoint. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endpointArn: z.string().describe('The ARN of the endpoint'),
    attributes: z.record(z.any()).describe('Attributes to set'),
  }),
  execute: async ({ awsCredentials, region, endpointArn, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new SetEndpointAttributesCommand({
          EndpointArn: endpointArn,
          Attributes: attributes,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Attributes set successfully for endpoint ${endpointArn}`,
              };
    } catch (err) {
      return { error: 'Failed to set attributes of a platform endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
