import { tool } from 'ai';
import { z } from 'zod';
import { PutTelemetryRecordsCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsPutTelemetryRecords = tool({
  description: 'Used by the AWS X-Ray daemon to upload telemetry. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    telemetryRecords: z.array(z.record(z.any())).describe('Array of telemetry records'),
    eC2InstanceId: z.string().optional().describe('EC2 instance ID'),
    hostname: z.string().optional().describe('Hostname'),
    resourceARN: z.string().optional().describe('Resource ARN'),
  }),
  execute: async ({ awsCredentials, region, telemetryRecords, eC2InstanceId, hostname, resourceARN }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new PutTelemetryRecordsCommand({
          TelemetryRecords: telemetryRecords,
          EC2InstanceId: eC2InstanceId,
          Hostname: hostname,
          ResourceARN: resourceARN,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to used by the AWS X-Ray daemon to upload telemetry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
