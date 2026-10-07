// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jfrogRequest, failedResult, toJfrogError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'JFrog credentials JSON with baseUrl (Platform URL, e.g. https://mycompany.jfrog.io) plus accessToken, apiKey, or username+password',
  );
const usernameField = z.string().describe('Username');
const groupNameField = z.string().describe('Group name');
const targetNameField = z.string().describe('Permission target name');

export const jfrogListUsers = tool({
  description: 'List Artifactory users. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/users');
      if (!result.ok) return failedResult('Failed to list users', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing users');
    }
  },
});

export const jfrogGetUser = tool({
  description: 'Get one Artifactory user: email, admin flag, groups, and profile settings.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    username: usernameField,
  }),
  execute: async ({ jfrogCredentials, username }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/users/${username}`,
      );
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting user');
    }
  },
});

export const jfrogSaveUser = tool({
  description:
    'Create a new user or fully replace an existing one (name, email, password, admin flag, groups). Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    username: usernameField,
    user: z
      .record(z.string(), z.any())
      .describe(
        'User object: email, password, admin (boolean), profileUpdatableGroups, disableUIAccess, internalPasswordDisabled, groups (string[])',
      ),
  }),
  execute: async ({ jfrogCredentials, username, user }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/users/${username}`,
        {
          method: 'PUT',
          body: { name: username, ...user },
        },
      );
      if (!result.ok) return failedResult('Failed to save user', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error saving user');
    }
  },
});

export const jfrogDeleteUser = tool({
  description: 'Delete an Artifactory user. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    username: usernameField,
  }),
  execute: async ({ jfrogCredentials, username }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/users/${username}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete user', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting user');
    }
  },
});

export const jfrogChangePassword = tool({
  description:
    'Change a user password (own password with the old one, or any user as admin). Use for credential rotation.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    username: z.string().describe('User whose password changes'),
    oldPassword: z
      .string()
      .optional()
      .describe('Current password (required for non-admin self-change)'),
    newPassword: z.string().describe('New password'),
  }),
  execute: async ({ jfrogCredentials, username, oldPassword, newPassword }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        '/security/users/authorization/changePassword',
        {
          method: 'POST',
          body: {
            userName: username,
            ...(oldPassword !== undefined ? { oldPassword } : {}),
            newPassword,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to change password', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error changing password');
    }
  },
});

export const jfrogListGroups = tool({
  description: 'List Artifactory groups. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/groups');
      if (!result.ok) return failedResult('Failed to list groups', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing groups');
    }
  },
});

export const jfrogGetGroup = tool({
  description: 'Get one group: description, auto-join, admin privileges, and members.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    groupName: groupNameField,
  }),
  execute: async ({ jfrogCredentials, groupName }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/groups/${groupName}`,
      );
      if (!result.ok) return failedResult('Failed to get group', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting group');
    }
  },
});

export const jfrogSaveGroup = tool({
  description:
    'Create a new group or replace an existing one (description, autoJoin, adminPrivileges, realm, users). Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    groupName: groupNameField,
    group: z
      .record(z.string(), z.any())
      .describe(
        'Group object: description, autoJoin, adminPrivileges, realm, realmAttributes, users (string[])',
      ),
  }),
  execute: async ({ jfrogCredentials, groupName, group }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/groups/${groupName}`,
        {
          method: 'PUT',
          body: { name: groupName, ...group },
        },
      );
      if (!result.ok) return failedResult('Failed to save group', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error saving group');
    }
  },
});

export const jfrogDeleteGroup = tool({
  description: 'Delete a group. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    groupName: groupNameField,
  }),
  execute: async ({ jfrogCredentials, groupName }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/groups/${groupName}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete group', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting group');
    }
  },
});

export const jfrogListPermissionTargets = tool({
  description: 'List permission targets. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/permissions');
      if (!result.ok) return failedResult('Failed to list permission targets', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing permission targets');
    }
  },
});

export const jfrogGetPermissionTarget = tool({
  description:
    'Get one permission target: repositories, include/exclude patterns, and user/group principals. Use to audit access.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    targetName: targetNameField,
  }),
  execute: async ({ jfrogCredentials, targetName }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/permissions/${targetName}`,
      );
      if (!result.ok) return failedResult('Failed to get permission target', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting permission target');
    }
  },
});

export const jfrogSavePermissionTarget = tool({
  description:
    'Create or replace a permission target (repositories, patterns, user/group principals with read/write/manage/delete/annotate permissions). Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    targetName: targetNameField,
    permission: z
      .record(z.string(), z.any())
      .describe(
        'Permission target object: includesPattern, excludesPattern, repositories (string[]), principals {users, groups}',
      ),
  }),
  execute: async ({ jfrogCredentials, targetName, permission }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/permissions/${targetName}`,
        { method: 'PUT', body: { name: targetName, ...permission } },
      );
      if (!result.ok) return failedResult('Failed to save permission target', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error saving permission target');
    }
  },
});

export const jfrogDeletePermissionTarget = tool({
  description: 'Delete a permission target. Requires admin privileges.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    targetName: targetNameField,
  }),
  execute: async ({ jfrogCredentials, targetName }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'artifactory',
        `/security/permissions/${targetName}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete permission target', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting permission target');
    }
  },
});

export const jfrogGetApiKey = tool({
  description:
    'Get the authenticated user API key for legacy X-JFrog-Art-Api authentication. Returns an error when no key exists.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/apiKey');
      if (!result.ok) return failedResult('Failed to get API key', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting API key');
    }
  },
});

export const jfrogCreateApiKey = tool({
  description: 'Create an API key for the authenticated user. Optionally supply a fixed key value.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    apiKey: z.string().optional().describe('Fixed API key value; omit to auto-generate'),
  }),
  execute: async ({ jfrogCredentials, apiKey }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/apiKey', {
        method: 'POST',
        body: apiKey !== undefined ? { apiKey } : {},
      });
      if (!result.ok) return failedResult('Failed to create API key', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error creating API key');
    }
  },
});

export const jfrogRegenerateApiKey = tool({
  description: 'Regenerate (rotate) the authenticated user API key. The old key stops working.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/apiKey', {
        method: 'PUT',
        body: {},
      });
      if (!result.ok) return failedResult('Failed to regenerate API key', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error regenerating API key');
    }
  },
});

export const jfrogRevokeApiKey = tool({
  description: 'Revoke (delete) the authenticated user API key.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/apiKey', {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to revoke API key', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error revoking API key');
    }
  },
});

export const jfrogCreateArtifactoryToken = tool({
  description:
    'Create a scoped access token via the Artifactory security API (form-encoded, legacy). Prefer the Access token tools for new integrations.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    username: z.string().optional().describe('User to create the token for (defaults to caller)'),
    scope: z
      .string()
      .optional()
      .describe('Token scope, e.g. "member-of-groups:readers" or "applied-permissions/admin"'),
    expiresIn: z.number().int().optional().describe('Expiry in seconds; 0 means non-expiring'),
    refreshable: z.boolean().optional().describe('Whether the token is refreshable'),
    audience: z.string().optional().describe('Audience (service ID) the token is issued for'),
  }),
  execute: async ({ jfrogCredentials, username, scope, expiresIn, refreshable, audience }) => {
    try {
      const form = new URLSearchParams();
      if (username !== undefined) form.set('username', username);
      if (scope !== undefined) form.set('scope', scope);
      if (expiresIn !== undefined) form.set('expires_in', String(expiresIn));
      if (refreshable !== undefined) form.set('refreshable', String(refreshable));
      if (audience !== undefined) form.set('audience', audience);
      const result = await jfrogRequest(jfrogCredentials, 'artifactory', '/security/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        rawBody: form.toString(),
      });
      if (!result.ok) return failedResult('Failed to create token', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error creating token');
    }
  },
});
