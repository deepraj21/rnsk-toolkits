// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { oktaRequest, failedResult, toOktaError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const groupIdField = z.string().describe('Group ID');

export const oktaListGroups = tool({
  description: 'List groups with optional search filter and pagination.',
  inputSchema: z.object({
    oktaCredentials: credField,
    limit: z.number().int().min(1).max(200).optional(),
    after: z.string().optional().describe('Pagination cursor'),
    filter: z.string().optional().describe('Filter, e.g. type eq "OKTA_GROUP"'),
    search: z.string().optional(),
  }),
  execute: async ({ oktaCredentials, limit, after, filter, search }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/groups', {
        query: { limit, after, filter, search },
      });
      if (!result.ok) return failedResult('Failed to list groups', result);
      return { groups: result.data, link: result.headers.link };
    } catch (error) {
      return toOktaError(error, 'Error listing groups');
    }
  },
});

export const oktaGetGroup = tool({
  description: 'Get a group by ID.',
  inputSchema: z.object({
    oktaCredentials: credField,
    groupId: groupIdField,
  }),
  execute: async ({ oktaCredentials, groupId }) => {
    try {
      const result = await oktaRequest(oktaCredentials, `/groups/${encodeURIComponent(groupId)}`);
      if (!result.ok) return failedResult('Failed to get group', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error getting group');
    }
  },
});

export const oktaCreateGroup = tool({
  description: 'Create an Okta group (OKTA_GROUP) with name and optional description.',
  inputSchema: z.object({
    oktaCredentials: credField,
    name: z.string().describe('Group name'),
    description: z.string().optional(),
  }),
  execute: async ({ oktaCredentials, name, description }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/groups', {
        method: 'POST',
        body: {
          profile: {
            name,
            ...(description !== undefined ? { description } : {}),
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create group', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error creating group');
    }
  },
});

export const oktaUpdateGroup = tool({
  description: 'Update group profile (name, description).',
  inputSchema: z.object({
    oktaCredentials: credField,
    groupId: groupIdField,
    name: z.string().optional(),
    description: z.string().optional(),
  }),
  execute: async ({ oktaCredentials, groupId, name, description }) => {
    try {
      const profile: Record<string, string> = {};
      if (name !== undefined) profile.name = name;
      if (description !== undefined) profile.description = description;
      const result = await oktaRequest(oktaCredentials, `/groups/${encodeURIComponent(groupId)}`, {
        method: 'PUT',
        body: { profile },
      });
      if (!result.ok) return failedResult('Failed to update group', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error updating group');
    }
  },
});

export const oktaDeleteGroup = tool({
  description: 'Delete a group by ID.',
  inputSchema: z.object({
    oktaCredentials: credField,
    groupId: groupIdField,
  }),
  execute: async ({ oktaCredentials, groupId }) => {
    try {
      const result = await oktaRequest(oktaCredentials, `/groups/${encodeURIComponent(groupId)}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete group', result);
      return result.data ?? { deleted: true, groupId };
    } catch (error) {
      return toOktaError(error, 'Error deleting group');
    }
  },
});

export const oktaListGroupUsers = tool({
  description: 'List users who are members of a group.',
  inputSchema: z.object({
    oktaCredentials: credField,
    groupId: groupIdField,
    limit: z.number().int().optional(),
    after: z.string().optional(),
  }),
  execute: async ({ oktaCredentials, groupId, limit, after }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/groups/${encodeURIComponent(groupId)}/users`,
        { query: { limit, after } },
      );
      if (!result.ok) return failedResult('Failed to list group users', result);
      return { users: result.data, link: result.headers.link };
    } catch (error) {
      return toOktaError(error, 'Error listing group users');
    }
  },
});

export const oktaAddUserToGroup = tool({
  description: 'Add a user to a group.',
  inputSchema: z.object({
    oktaCredentials: credField,
    groupId: groupIdField,
    userId: z.string().describe('User ID'),
  }),
  execute: async ({ oktaCredentials, groupId, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/groups/${encodeURIComponent(groupId)}/users/${encodeURIComponent(userId)}`,
        { method: 'PUT' },
      );
      if (!result.ok) return failedResult('Failed to add user to group', result);
      return result.data ?? { added: true, groupId, userId };
    } catch (error) {
      return toOktaError(error, 'Error adding user to group');
    }
  },
});

export const oktaRemoveUserFromGroup = tool({
  description: 'Remove a user from a group.',
  inputSchema: z.object({
    oktaCredentials: credField,
    groupId: groupIdField,
    userId: z.string().describe('User ID'),
  }),
  execute: async ({ oktaCredentials, groupId, userId }) => {
    try {
      const result = await oktaRequest(
        oktaCredentials,
        `/groups/${encodeURIComponent(groupId)}/users/${encodeURIComponent(userId)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to remove user from group', result);
      return result.data ?? { removed: true, groupId, userId };
    } catch (error) {
      return toOktaError(error, 'Error removing user from group');
    }
  },
});
