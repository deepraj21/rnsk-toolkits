import { tool } from 'ai';
import { z } from 'zod';
import { ModifyDBParameterGroupCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsModifyDbParameterGroup = tool({
  description: 'Modify parameters in an RDS parameter group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbParameterGroupName: z.string().describe('Parameter group name to modify'),
    parameters: z.array(z.record(z.any())).describe('Parameters to modify'),
    properties: z.string().optional().describe('Parameter name'),
    ParameterName: z.string().optional().describe('Parameter name'),
    ParameterValue: z.string().optional().describe('Parameter value'),
    ApplyMethod: z.string().optional().describe('immediate or pending-reboot'),
  }),
  execute: async ({ awsCredentials, region, dbParameterGroupName, parameters, properties, ParameterName, ParameterValue, ApplyMethod }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new ModifyDBParameterGroupCommand({
          DBParameterGroupName: dbParameterGroupName,
          Parameters: parameters,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to modify parameters in an RDS parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
