import { tool } from 'ai';
import { z } from 'zod';
import { CreateStackCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsCreateCloudformationStack = tool({
  description: 'Create a new CloudFormation stack. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    templateBody: z.string().optional().describe('Template body as JSON or YAML string'),
    templateURL: z.string().optional().describe('URL to template file in S3'),
    parameters: z.array(z.record(z.any())).optional().describe('Array of parameter objects with ParameterKey and ParameterValue'),
    capabilities: z.array(z.string()).optional().describe('Capabilities (CAPABILITY_IAM, CAPABILITY_NAMED_IAM, CAPABILITY_AUTO_EXPAND)'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the stack'),
    timeoutInMinutes: z.number().optional().describe('Stack creation timeout in minutes'),
  }),
  execute: async ({ awsCredentials, region, stackName, templateBody, templateURL, parameters, capabilities, tags, timeoutInMinutes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new CreateStackCommand({
          StackName: stackName,
          TemplateBody: templateBody,
          TemplateURL: templateURL,
          Parameters: parameters,
          Capabilities: capabilities as any,
          Tags: tags,
          TimeoutInMinutes: timeoutInMinutes,
      } as any);
      const response = await client.send(command);
      return { stackId: response.StackId };
    } catch (err) {
      return { error: 'Failed to create a new CloudFormation stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
