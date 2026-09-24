import { tool } from 'ai';
import { z } from 'zod';
import { CreateStackSetCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsCreateCloudformationStackSet = tool({
  description: 'Create a CloudFormation stack set. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackSetName: z.string().describe('Name of the stack set'),
    templateBody: z.string().optional().describe('Template body'),
    templateURL: z.string().optional().describe('URL to template file'),
    parameters: z.array(z.record(z.any())).optional().describe('Array of parameter objects'),
    capabilities: z.array(z.string()).optional().describe('Capabilities'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    administrationRoleARN: z.string().optional().describe('Administration role ARN'),
    executionRoleName: z.string().optional().describe('Execution role name'),
  }),
  execute: async ({ awsCredentials, region, stackSetName, templateBody, templateURL, parameters, capabilities, tags, administrationRoleARN, executionRoleName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new CreateStackSetCommand({
          StackSetName: stackSetName,
          TemplateBody: templateBody,
          TemplateURL: templateURL,
          Parameters: parameters,
          Capabilities: capabilities as any,
          Tags: tags,
          AdministrationRoleARN: administrationRoleARN,
          ExecutionRoleName: executionRoleName,
      } as any);
      const response = await client.send(command);
      return { stackSetId: response.StackSetId };
    } catch (err) {
      return { error: 'Failed to create a CloudFormation stack set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
