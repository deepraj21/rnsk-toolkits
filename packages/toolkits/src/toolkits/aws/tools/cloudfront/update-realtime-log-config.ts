import { tool } from 'ai';
import { z } from 'zod';
import { UpdateRealtimeLogConfigCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontRealtimeLogConfig = tool({
  description: 'Update a CloudFront real-time log config. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endPoints: z.array(z.record(z.any())).describe('End points for the real-time log config'),
    fields: z.array(z.string()).describe('Fields to include in the real-time log'),
    name: z.string().describe('The real-time log config name'),
    samplingRate: z.number().describe('Sampling rate (0-100)'),
  }),
  execute: async ({ awsCredentials, region, endPoints, fields, name, samplingRate }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateRealtimeLogConfigCommand({
          EndPoints: endPoints,
          Fields: fields,
          Name: name,
          SamplingRate: samplingRate,
      } as any);
      const response = await client.send(command);
      return {
                  realtimeLogConfig: response.RealtimeLogConfig,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront real-time log config', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
