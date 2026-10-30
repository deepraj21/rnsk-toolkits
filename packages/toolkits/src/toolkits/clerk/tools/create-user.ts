// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, compact } from './client.js';

export const clerkCreateUser = tool({
  description:
    'Creates a user in the Clerk instance. Provide at least one identifier: email address, phone number, or username (plus a password if you want password sign-in). Use skipPasswordChecks for admin-created accounts where no password is known. Returns the new user with its user ID.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    emailAddresses: z.array(z.string()).optional().describe('Email addresses for the user'),
    phoneNumbers: z.array(z.string()).optional().describe('Phone numbers for the user (E.164)'),
    username: z.string().optional().describe('Username'),
    password: z
      .string()
      .optional()
      .describe('Password (checked against the instance password policy unless skipped)'),
    firstName: z.string().optional().describe('First name'),
    lastName: z.string().optional().describe('Last name'),
    externalId: z.string().optional().describe('Your system’s ID for this user'),
    publicMetadata: z
      .record(z.any())
      .optional()
      .describe('Public metadata (readable from the client)'),
    privateMetadata: z.record(z.any()).optional().describe('Private metadata (server-only)'),
    skipPasswordChecks: z
      .boolean()
      .optional()
      .describe('Skip password policy/compromised checks (admin-created users)'),
    skipPasswordRequirement: z
      .boolean()
      .optional()
      .describe('Allow creating the user without a password'),
  }),
  execute: async ({
    clerkToken,
    emailAddresses,
    phoneNumbers,
    username,
    password,
    firstName,
    lastName,
    externalId,
    publicMetadata,
    privateMetadata,
    skipPasswordChecks,
    skipPasswordRequirement,
  }) => {
    const body = compact({
      email_address: emailAddresses,
      phone_number: phoneNumbers,
      username,
      password,
      first_name: firstName,
      last_name: lastName,
      external_id: externalId,
      public_metadata: publicMetadata,
      private_metadata: privateMetadata,
      skip_password_checks: skipPasswordChecks,
      skip_password_requirement: skipPasswordRequirement,
    });

    if (Object.keys(body).length === 0) {
      return {
        error: 'Provide at least one identifier: emailAddresses, phoneNumbers, or username.',
      };
    }

    const result = await clerkRequest(clerkToken, '/users', { method: 'POST', body });
    if (result.error) return result;
    return result.data;
  },
});
