import { tool } from 'ai';
import { z } from 'zod';
import { CreateChangeSetCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsCreateCloudformationChangeset = tool({
  description: 'Create a CloudFormation change set. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    changeSetName: z.string().describe('Name of the change set'),
    templateBody: z.string().optional().describe('Template body'),
    templateURL: z.string().optional().describe('URL to template file'),
    parameters: z.array(z.record(z.any())).optional().describe('Array of parameter objects'),
    capabilities: z.array(z.string()).optional().describe('Capabilities'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    changeSetType: z.string().optional().describe('Type: CREATE, UPDATE, or IMPORT'),
  }),
  execute: async ({ awsCredentials, region, stackName, changeSetName, templateBody, templateURL, parameters, capabilities, tags, changeSetType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new CreateChangeSetCommand({
          StackName: stackName,
          ChangeSetName: changeSetName,
          TemplateBody: templateBody,
          TemplateURL: templateURL,
          Parameters: parameters,
          Capabilities: capabilities as any,
          Tags: tags,
          ChangeSetType: changeSetType as any,
      } as any);
      const response = await client.send(command);
      return { id: response.Id, stackId: response.StackId };
    } catch (err) {
      return { error: 'Failed to create a CloudFormation change set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
