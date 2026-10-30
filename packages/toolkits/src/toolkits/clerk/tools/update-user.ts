// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, compact } from './client.js';

export const clerkUpdateUser = tool({
  description:
    'Updates a Clerk user (PATCH). Only provided fields change — rename, change username, set the primary email address, reset a password, or sign the user out of all other sessions. Use setUserMetadata for metadata (it is a separate endpoint).',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().describe('User ID to update'),
    firstName: z.string().optional().describe('New first name'),
    lastName: z.string().optional().describe('New last name'),
    username: z.string().optional().describe('New username'),
    primaryEmailAddressId: z
      .string()
      .optional()
      .describe('Email address ID to make primary (from the user object)'),
    primaryPhoneNumberId: z.string().optional().describe('Phone number ID to make primary'),
    password: z.string().optional().describe('New password'),
    skipPasswordChecks: z
      .boolean()
      .optional()
      .describe('Skip password policy checks when setting the password'),
    signOutOfOtherSessions: z
      .boolean()
      .optional()
      .describe('Also sign this user out of every other session'),
    externalId: z.string().optional().describe('New external ID in your system'),
    locale: z.string().optional().describe('New locale, e.g. "en-US"'),
    timezone: z.string().optional().describe('New timezone, e.g. "America/New_York"'),
  }),
  execute: async ({
    clerkToken,
    userId,
    firstName,
    lastName,
    username,
    primaryEmailAddressId,
    primaryPhoneNumberId,
    password,
    skipPasswordChecks,
    signOutOfOtherSessions,
    externalId,
    locale,
    timezone,
  }) => {
    const body = compact({
      first_name: firstName,
      last_name: lastName,
      username,
      primary_email_address_id: primaryEmailAddressId,
      primary_phone_number_id: primaryPhoneNumberId,
      password,
      skip_password_checks: skipPasswordChecks,
      sign_out_of_other_sessions: signOutOfOtherSessions,
      external_id: externalId,
      locale,
      timezone,
    });

    if (Object.keys(body).length === 0) {
      return { error: 'No fields provided to update. Include at least one field to change.' };
    }

    const result = await clerkRequest(clerkToken, `/users/${userId}`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
