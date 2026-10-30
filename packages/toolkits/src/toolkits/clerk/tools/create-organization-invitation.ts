// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, compact } from './client.js';

export const clerkCreateOrganizationInvitation = tool({
  description:
    'Invites an email address to join a Clerk organization with a role (e.g. \"basic_member\", \"org:admin\"). Clerk emails the invitation with an accept link; once accepted the invitee becomes a member. Set notify=false to create the invitation without sending the email.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug'),
    emailAddress: z.string().describe('Email address to invite'),
    role: z
      .string()
      .optional()
      .describe('Role to grant on acceptance (default \"basic_member\"), e.g. \"org:admin\"'),
    redirectUrl: z.string().optional().describe('URL to redirect the invitee to after they accept'),
    notify: z
      .boolean()
      .optional()
      .describe('Whether to email the invitation (default true). Set false to create silently.'),
    expiresInSeconds: z.number().optional().describe('Invitation lifetime in seconds'),
  }),
  execute: async ({
    clerkToken,
    organizationId,
    emailAddress,
    role,
    redirectUrl,
    notify,
    expiresInSeconds,
  }) => {
    const result = await clerkRequest(clerkToken, `/organizations/${organizationId}/invitations`, {
      method: 'POST',
      query: { email_address: emailAddress },
      body: compact({
        role,
        redirect_url: redirectUrl,
        notify,
        expires_in_seconds: expiresInSeconds,
      }),
    });
    if (result.error) return result;
    return result.data;
  },
});
