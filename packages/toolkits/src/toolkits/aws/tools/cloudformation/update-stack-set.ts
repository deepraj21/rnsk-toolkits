import { tool } from 'ai';
import { z } from 'zod';
import { UpdateStackSetCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsUpdateCloudformationStackSet = tool({
  description: 'Update a CloudFormation stack set. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackSetName: z.string().describe('Name of the stack set'),
    templateBody: z.string().optional().describe('Template body'),
    templateURL: z.string().optional().describe('URL to template file'),
    parameters: z.array(z.record(z.any())).optional().describe('Array of parameter objects'),
    capabilities: z.array(z.string()).optional().describe('Capabilities'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    operationPreferences: z.record(z.any()).optional().describe('Operation preferences'),
  }),
  execute: async ({ awsCredentials, region, stackSetName, templateBody, templateURL, parameters, capabilities, tags, operationPreferences }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new UpdateStackSetCommand({
          StackSetName: stackSetName,
          TemplateBody: templateBody,
          TemplateURL: templateURL,
          Parameters: parameters,
          Capabilities: capabilities as any,
          Tags: tags,
          OperationPreferences: operationPreferences,
      } as any);
      const response = await client.send(command);
      return { operationId: response.OperationId };
    } catch (err) {
      return { error: 'Failed to update a CloudFormation stack set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
