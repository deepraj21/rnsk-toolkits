// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { oktaRequest, failedResult, toOktaError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const userIdField = z.string().describe('User ID or login');

export const oktaGetCurrentUser = tool({
  description: 'Get the Okta user associated with the API token (GET /users/me).',
  inputSchema: z.object({ oktaCredentials: credField }),
  execute: async ({ oktaCredentials }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/users/me');
      if (!result.ok) return failedResult('Failed to get current user', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error getting current user');
    }
  },
});

export const oktaListUsers = tool({
  description:
    'List users in the Okta org with optional search filter and cursor pagination (limit, after).',
  inputSchema: z.object({
    oktaCredentials: credField,
    limit: z.number().int().min(1).max(200).optional().describe('Page size (max 200)'),
    after: z.string().optional().describe('Pagination cursor from Link header'),
    filter: z.string().optional().describe('Okta filter expression, e.g. status eq "ACTIVE"'),
    search: z.string().optional().describe('SCIM search expression'),
  }),
  execute: async ({ oktaCredentials, limit, after, filter, search }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/users', {
        query: { limit, after, filter, search },
      });
      if (!result.ok) return failedResult('Failed to list users', result);
      return { users: result.data, link: result.headers.link };
    } catch (error) {
      return toOktaError(error, 'Error listing users');
    }
  },
});

export const oktaGetUser = tool({
  description: 'Get one user by ID or login (email).',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
  }),
  execute: async ({ oktaCredentials, userId }) => {
    try {
      const result = await oktaRequest(oktaCredentials, `/users/${encodeURIComponent(userId)}`);
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error getting user');
    }
  },
});

export const oktaCreateUser = tool({
  description:
    'Create a user with profile and optional credentials. Use activate=false to create staged users.',
  inputSchema: z.object({
    oktaCredentials: credField,
    profile: z
      .record(z.string(), z.any())
      .describe('User profile (firstName, lastName, email, login, etc.)'),
    credentials: z.record(z.string(), z.any()).optional().describe('Optional credentials object'),
    groupIds: z.array(z.string()).optional().describe('Group IDs to assign on creation'),
    activate: z.boolean().optional().describe('Activate immediately (default true)'),
  }),
  execute: async ({ oktaCredentials, profile, credentials, groupIds, activate }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/users', {
        method: 'POST',
        query: activate === false ? { activate: false } : undefined,
        body: {
          profile,
          ...(credentials !== undefined ? { credentials } : {}),
          ...(groupIds !== undefined ? { groupIds } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create user', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error creating user');
    }
  },
});

export const oktaUpdateUser = tool({
  description: 'Update a user profile (partial update via POST /users/{id}).',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
    profile: z.record(z.string(), z.any()).describe('Profile fields to update'),
  }),
  execute: async ({ oktaCredentials, userId, profile }) => {
    try {
      const result = await oktaRequest(oktaCredentials, `/users/${encodeURIComponent(userId)}`, {
        method: 'POST',
        body: { profile },
      });
      if (!result.ok) return failedResult('Failed to update user', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error updating user');
    }
  },
});

export const oktaSuspendUser = tool({
  description: 'Suspend a user (blocks sign-in; reversible with unsuspend).',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
  }),
  execute: async ({ oktaCredentials, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/lifecycle/suspend`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to suspend user', result);
      return result.data ?? { suspended: true, userId };
    } catch (error) {
      return toOktaError(error, 'Error suspending user');
    }
  },
});

export const oktaUnsuspendUser = tool({
  description: 'Unsuspend a previously suspended user.',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
  }),
  execute: async ({ oktaCredentials, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/lifecycle/unsuspend`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to unsuspend user', result);
      return result.data ?? { unsuspended: true, userId };
    } catch (error) {
      return toOktaError(error, 'Error unsuspending user');
    }
  },
});

export const oktaDeactivateUser = tool({
  description: 'Deactivate a user (soft delete; can be reactivated).',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
  }),
  execute: async ({ oktaCredentials, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/lifecycle/deactivate`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to deactivate user', result);
      return result.data ?? { deactivated: true, userId };
    } catch (error) {
      return toOktaError(error, 'Error deactivating user');
    }
  },
});

export const oktaActivateUser = tool({
  description: 'Activate a staged or deactivated user.',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
    sendEmail: z.boolean().optional().describe('Send activation email'),
  }),
  execute: async ({ oktaCredentials, userId, sendEmail }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/lifecycle/activate`,
        {
          method: 'POST',
          query: sendEmail !== undefined ? { sendEmail } : undefined,
        },
      );
      if (!result.ok) return failedResult('Failed to activate user', result);
      return result.data ?? { activated: true, userId };
    } catch (error) {
      return toOktaError(error, 'Error activating user');
    }
  },
});

export const oktaResetUserPassword = tool({
  description: 'Send a password reset or set temporary password for a user.',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
    sendEmail: z.boolean().optional().describe('Email reset link to user'),
  }),
  execute: async ({ oktaCredentials, userId, sendEmail }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/lifecycle/reset_password`,
        {
          method: 'POST',
          query: sendEmail !== undefined ? { sendEmail } : undefined,
        },
      );
      if (!result.ok) return failedResult('Failed to reset user password', result);
      return result.data ?? { reset: true, userId };
    } catch (error) {
      return toOktaError(error, 'Error resetting user password');
    }
  },
});

export const oktaListUserGroups = tool({
  description: 'List groups a user belongs to.',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
  }),
  execute: async ({ oktaCredentials, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/groups`,
      );
      if (!result.ok) return failedResult('Failed to list user groups', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error listing user groups');
    }
  },
});

export const oktaListUserApps = tool({
  description: 'List app links assigned to a user.',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
  }),
  execute: async ({ oktaCredentials, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/appLinks`,
      );
      if (!result.ok) return failedResult('Failed to list user apps', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error listing user apps');
    }
  },
});

export const oktaListUserFactors = tool({
  description: 'List MFA factors enrolled for a user.',
  inputSchema: z.object({
    oktaCredentials: credField,
    userId: userIdField,
  }),
  execute: async ({ oktaCredentials, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/users/${encodeURIComponent(userId)}/factors`,
      );
      if (!result.ok) return failedResult('Failed to list user factors', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error listing user factors');
    }
  },
});
