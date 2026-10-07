// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zendeskRequest, failedResult, toZendeskError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Zendesk credentials JSON with subdomain, plus email+apiToken (API token) or accessToken (OAuth)',
  );
const userIdField = z.number().int().describe('User ID');

const userField = z
  .record(z.string(), z.any())
  .describe(
    'User object: name, email, role (end-user/agent/admin), organization_id, tags, phone, details, verified, user_fields',
  );

export const zendeskListUsers = tool({
  description: 'List users with roles and pagination. Use search for filters.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    perPage: z.number().int().min(1).max(100).optional().describe('Users per page'),
    page: z.number().int().min(1).optional().describe('Page number'),
  }),
  execute: async ({ zendeskCredentials, perPage, page }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users.json', {
        query: { per_page: perPage, page },
      });
      if (!result.ok) return failedResult('Failed to list users', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing users');
    }
  },
});

export const zendeskGetUser = tool({
  description: 'Get one user with role, tags, and custom fields.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
  }),
  execute: async ({ zendeskCredentials, userId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/users/${userId}.json`);
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting user');
    }
  },
});

export const zendeskGetCurrentUser = tool({
  description: 'Get the authenticated user (me). Use to verify credentials.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users/me.json');
      if (!result.ok) return failedResult('Failed to get current user', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting current user');
    }
  },
});

export const zendeskCreateUser = tool({
  description: 'Create an end-user or agent (name, email, role, organization).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    user: userField,
  }),
  execute: async ({ zendeskCredentials, user }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users.json', {
        method: 'POST',
        body: { user },
      });
      if (!result.ok) return failedResult('Failed to create user', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating user');
    }
  },
});

export const zendeskUpdateUser = tool({
  description: 'Update a user (role, tags, organization, custom fields).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
    user: userField,
  }),
  execute: async ({ zendeskCredentials, userId, user }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/users/${userId}.json`, {
        method: 'PUT',
        body: { user },
      });
      if (!result.ok) return failedResult('Failed to update user', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating user');
    }
  },
});

export const zendeskDeleteUser = tool({
  description: 'Delete a user (end-users only; agents must be downgraded first).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
  }),
  execute: async ({ zendeskCredentials, userId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/users/${userId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete user', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting user');
    }
  },
});

export const zendeskCreateManyUsers = tool({
  description: 'Create up to 100 users in one call. Use for migrations.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    users: z.array(userField).min(1).max(100).describe('Users to create'),
  }),
  execute: async ({ zendeskCredentials, users }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users/create_many.json', {
        method: 'POST',
        body: { users },
      });
      if (!result.ok) return failedResult('Failed to create users', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating users');
    }
  },
});

export const zendeskUpdateManyUsers = tool({
  description: 'Update up to 100 users by ID in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ids: z.array(z.number().int()).min(1).max(100).describe('User IDs'),
    user: userField,
  }),
  execute: async ({ zendeskCredentials, ids, user }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users/update_many.json', {
        method: 'PUT',
        query: { ids },
        body: { user },
      });
      if (!result.ok) return failedResult('Failed to update users', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating users');
    }
  },
});

export const zendeskDeleteManyUsers = tool({
  description: 'Delete up to 100 users by ID in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ids: z.array(z.number().int()).min(1).max(100).describe('User IDs'),
  }),
  execute: async ({ zendeskCredentials, ids }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users/destroy_many.json', {
        method: 'DELETE',
        query: { ids },
      });
      if (!result.ok) return failedResult('Failed to delete users', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting users');
    }
  },
});

export const zendeskSearchUsers = tool({
  description: 'Search users by name, email, or custom fields.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    query: z.string().describe('Search text, e.g. an email address'),
  }),
  execute: async ({ zendeskCredentials, query }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users/search.json', {
        query: { query },
      });
      if (!result.ok) return failedResult('Failed to search users', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error searching users');
    }
  },
});

export const zendeskShowManyUsers = tool({
  description: 'Fetch up to 100 users by ID in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ids: z.array(z.number().int()).min(1).max(100).describe('User IDs'),
  }),
  execute: async ({ zendeskCredentials, ids }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/users/show_many.json', {
        query: { ids },
      });
      if (!result.ok) return failedResult('Failed to show users', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error showing users');
    }
  },
});

export const zendeskListUserTickets = tool({
  description: 'List tickets of a user by relation: requested, ccd, assigned, or following.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
    relation: z.enum(['requested', 'ccd', 'assigned', 'following']).describe('Ticket relation'),
  }),
  execute: async ({ zendeskCredentials, userId, relation }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/users/${userId}/tickets/${relation}.json`,
      );
      if (!result.ok) return failedResult('Failed to list user tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing user tickets');
    }
  },
});

export const zendeskListUserIdentities = tool({
  description: 'List login identities (email, social) of a user.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
  }),
  execute: async ({ zendeskCredentials, userId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/users/${userId}/identities.json`);
      if (!result.ok) return failedResult('Failed to list user identities', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing user identities');
    }
  },
});

export const zendeskCreateUserIdentity = tool({
  description: 'Add a login identity (email) to a user. Sends verification unless skipped.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
    type: z.string().describe('Identity type, e.g. email'),
    value: z.string().describe('Identity value, e.g. an email address'),
    verified: z.boolean().optional().describe('Skip verification (admin only)'),
  }),
  execute: async ({ zendeskCredentials, userId, type, value, verified }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/users/${userId}/identities.json`, {
        method: 'POST',
        body: {
          identity: {
            type,
            value,
            ...(verified !== undefined ? { verified } : {}),
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create user identity', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating user identity');
    }
  },
});

export const zendeskMakeIdentityPrimary = tool({
  description: 'Make an identity the primary login identity of a user.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
    identityId: z.number().int().describe('Identity ID'),
  }),
  execute: async ({ zendeskCredentials, userId, identityId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/users/${userId}/identities/${identityId}/make_primary.json`,
        { method: 'PUT' },
      );
      if (!result.ok) return failedResult('Failed to make identity primary', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error making identity primary');
    }
  },
});

export const zendeskVerifyUserIdentity = tool({
  description: 'Mark a user identity as verified.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
    identityId: z.number().int().describe('Identity ID'),
  }),
  execute: async ({ zendeskCredentials, userId, identityId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/users/${userId}/identities/${identityId}/verify.json`,
        { method: 'PUT' },
      );
      if (!result.ok) return failedResult('Failed to verify user identity', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error verifying user identity');
    }
  },
});

export const zendeskDeleteUserIdentity = tool({
  description: 'Delete a secondary login identity of a user.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
    identityId: z.number().int().describe('Identity ID'),
  }),
  execute: async ({ zendeskCredentials, userId, identityId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/users/${userId}/identities/${identityId}.json`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete user identity', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting user identity');
    }
  },
});

export const zendeskListUserGroupMemberships = tool({
  description: 'List group memberships of a user.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
  }),
  execute: async ({ zendeskCredentials, userId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/users/${userId}/group_memberships.json`,
      );
      if (!result.ok) return failedResult('Failed to list user group memberships', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing user group memberships');
    }
  },
});

export const zendeskAssignUserToGroup = tool({
  description: 'Add a user to an agent group.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: userIdField,
    groupId: z.number().int().describe('Group ID'),
    default: z.boolean().optional().describe('Make it the default group'),
  }),
  execute: async ({ zendeskCredentials, userId, groupId, default: isDefault }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/group_memberships.json', {
        method: 'POST',
        body: {
          group_membership: {
            user_id: userId,
            group_id: groupId,
            ...(isDefault !== undefined ? { default: isDefault } : {}),
          },
        },
      });
      if (!result.ok) return failedResult('Failed to assign user to group', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error assigning user to group');
    }
  },
});

export const zendeskMakeGroupMembershipDefault = tool({
  description: 'Make a group membership the default group of a user.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    membershipId: z.number().int().describe('Group membership ID'),
  }),
  execute: async ({ zendeskCredentials, membershipId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/group_memberships/${membershipId}/make_default.json`,
        {
          method: 'PUT',
        },
      );
      if (!result.ok) return failedResult('Failed to make group membership default', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error making group membership default');
    }
  },
});

export const zendeskDeleteGroupMembership = tool({
  description: 'Remove a user from a group.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    membershipId: z.number().int().describe('Group membership ID'),
  }),
  execute: async ({ zendeskCredentials, membershipId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/group_memberships/${membershipId}.json`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete group membership', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting group membership');
    }
  },
});
