import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAccountPasswordPolicyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsUpdateAccountPasswordPolicy = tool({
  description: 'Update the password policy for the AWS account. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    minimumPasswordLength: z.number().optional().describe('Minimum password length (6-128)'),
    requireSymbols: z.boolean().optional().describe('Require at least one symbol'),
    requireNumbers: z.boolean().optional().describe('Require at least one number'),
    requireUppercaseCharacters: z.boolean().optional().describe('Require at least one uppercase letter'),
    requireLowercaseCharacters: z.boolean().optional().describe('Require at least one lowercase letter'),
    allowUsersToChangePassword: z.boolean().optional().describe('Allow users to change their own password'),
    maxPasswordAge: z.number().optional().describe('Number of days passwords are valid (enables password expiration)'),
    passwordReusePrevention: z.number().optional().describe('Number of previous passwords to prevent reuse'),
    hardExpiry: z.boolean().optional().describe('Prevent users from changing expired passwords via console'),
  }),
  execute: async ({ awsCredentials, region, minimumPasswordLength, requireSymbols, requireNumbers, requireUppercaseCharacters, requireLowercaseCharacters, allowUsersToChangePassword, maxPasswordAge, passwordReusePrevention, hardExpiry }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new UpdateAccountPasswordPolicyCommand({
          MinimumPasswordLength: minimumPasswordLength,
          RequireSymbols: requireSymbols,
          RequireNumbers: requireNumbers,
          RequireUppercaseCharacters: requireUppercaseCharacters,
          RequireLowercaseCharacters: requireLowercaseCharacters,
          AllowUsersToChangePassword: allowUsersToChangePassword,
          MaxPasswordAge: maxPasswordAge,
          PasswordReusePrevention: passwordReusePrevention,
          HardExpiry: hardExpiry,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update the password policy for the AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
