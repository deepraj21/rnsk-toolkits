// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );

export const databricksListSecretScopes = tool({
  description: 'List secret scopes available for storing credentials.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/scopes/list');
      if (!result.ok) return failedResult('Failed to list secret scopes', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing secret scopes');
    }
  },
});

export const databricksCreateSecretScope = tool({
  description:
    'Create a Databricks-backed secret scope for notebooks and jobs to read credentials from.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
    initialManagePrincipal: z
      .string()
      .optional()
      .describe('Principal (users/<name>) granted MANAGE on the scope; defaults to caller'),
  }),
  execute: async ({ databricksCredentials, scope, initialManagePrincipal }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/scopes/create', {
        method: 'POST',
        body: {
          scope,
          ...(initialManagePrincipal !== undefined
            ? { initial_manage_principal: initialManagePrincipal }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create secret scope', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating secret scope');
    }
  },
});

export const databricksDeleteSecretScope = tool({
  description: 'Delete a secret scope and all its secrets. Cannot be undone.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
  }),
  execute: async ({ databricksCredentials, scope }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/scopes/delete', {
        method: 'POST',
        body: { scope },
      });
      if (!result.ok) return failedResult('Failed to delete secret scope', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting secret scope');
    }
  },
});

export const databricksPutSecret = tool({
  description:
    'Store a secret value (overwrites existing). Values are write-only — they cannot be read back via API.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
    key: z.string().describe('Secret key'),
    stringValue: z.string().optional().describe('Secret value as text'),
  }),
  execute: async ({ databricksCredentials, scope, key, stringValue }) => {
    try {
      if (stringValue === undefined) {
        return { error: 'Failed to store secret', message: 'Provide stringValue.' };
      }
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/put', {
        method: 'PUT',
        body: { scope, key, string_value: stringValue },
      });
      if (!result.ok) return failedResult('Failed to store secret', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error storing secret');
    }
  },
});

export const databricksDeleteSecret = tool({
  description: 'Delete one secret key from a scope.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
    key: z.string().describe('Secret key'),
  }),
  execute: async ({ databricksCredentials, scope, key }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/delete', {
        method: 'POST',
        body: { scope, key },
      });
      if (!result.ok) return failedResult('Failed to delete secret', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting secret');
    }
  },
});

export const databricksListSecrets = tool({
  description: 'List secret keys in a scope (metadata only — values are never returned).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
  }),
  execute: async ({ databricksCredentials, scope }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/list', {
        query: { scope },
      });
      if (!result.ok) return failedResult('Failed to list secrets', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing secrets');
    }
  },
});

export const databricksListSecretAcls = tool({
  description: 'List ACLs (principal permissions) on a secret scope.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
  }),
  execute: async ({ databricksCredentials, scope }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/acls/list', {
        query: { scope },
      });
      if (!result.ok) return failedResult('Failed to list secret ACLs', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing secret ACLs');
    }
  },
});

export const databricksPutSecretAcl = tool({
  description: 'Grant a principal (user/group/service principal) permission on a secret scope.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
    principal: z.string().describe('Principal, e.g. users/alice@example.com'),
    permission: z.enum(['READ', 'WRITE', 'MANAGE']).describe('Permission level'),
  }),
  execute: async ({ databricksCredentials, scope, principal, permission }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/acls/put', {
        method: 'PUT',
        body: { scope, principal, permission },
      });
      if (!result.ok) return failedResult('Failed to grant secret ACL', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error granting secret ACL');
    }
  },
});

export const databricksDeleteSecretAcl = tool({
  description: 'Remove a principal permission from a secret scope.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scope: z.string().describe('Scope name'),
    principal: z.string().describe('Principal, e.g. users/alice@example.com'),
  }),
  execute: async ({ databricksCredentials, scope, principal }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/secrets/acls/delete', {
        method: 'POST',
        body: { scope, principal },
      });
      if (!result.ok) return failedResult('Failed to delete secret ACL', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting secret ACL');
    }
  },
});

export const databricksListScimUsers = tool({
  description: 'List workspace users via SCIM with optional filter and pagination.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    filter: z.string().optional().describe('SCIM filter, e.g. userName eq "alice@example.com"'),
    startIndex: z.number().int().min(1).optional().describe('1-based start index'),
    count: z.number().int().min(1).optional().describe('Resources per page'),
  }),
  execute: async ({ databricksCredentials, filter, startIndex, count }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/preview/scim/v2/Users', {
        query: { filter, startIndex, count },
      });
      if (!result.ok) return failedResult('Failed to list users', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing users');
    }
  },
});

export const databricksGetScimUser = tool({
  description: 'Get one SCIM user with groups, roles, and entitlements.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    userId: z.string().describe('SCIM user ID'),
  }),
  execute: async ({ databricksCredentials, userId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/preview/scim/v2/Users/${userId}`,
      );
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting user');
    }
  },
});

export const databricksCreateScimUser = tool({
  description: 'Provision a workspace user (userName, groups, entitlements). Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    user: z
      .record(z.string(), z.any())
      .describe(
        'SCIM user: userName, displayName, groups [{value}], entitlements [{value: allow-cluster-create / allow-instance-pool-create / workspace-access}]',
      ),
  }),
  execute: async ({ databricksCredentials, user }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/preview/scim/v2/Users', {
        method: 'POST',
        body: { schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'], ...user },
      });
      if (!result.ok) return failedResult('Failed to create user', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating user');
    }
  },
});

export const databricksUpdateScimUser = tool({
  description:
    'Replace a SCIM user resource (name, groups, entitlements, active flag). Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    userId: z.string().describe('SCIM user ID'),
    user: z.record(z.string(), z.any()).describe('Full SCIM user object (replaces existing)'),
  }),
  execute: async ({ databricksCredentials, userId, user }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/preview/scim/v2/Users/${userId}`,
        { method: 'PUT', body: user },
      );
      if (!result.ok) return failedResult('Failed to update user', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating user');
    }
  },
});

export const databricksDeleteScimUser = tool({
  description: 'Deprovision a workspace user. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    userId: z.string().describe('SCIM user ID'),
  }),
  execute: async ({ databricksCredentials, userId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/preview/scim/v2/Users/${userId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete user', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting user');
    }
  },
});

export const databricksListScimGroups = tool({
  description: 'List workspace groups via SCIM with optional filter and pagination.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    filter: z.string().optional().describe('SCIM filter, e.g. displayName eq "data-team"'),
    startIndex: z.number().int().min(1).optional().describe('1-based start index'),
    count: z.number().int().min(1).optional().describe('Resources per page'),
  }),
  execute: async ({ databricksCredentials, filter, startIndex, count }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/preview/scim/v2/Groups', {
        query: { filter, startIndex, count },
      });
      if (!result.ok) return failedResult('Failed to list groups', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing groups');
    }
  },
});

export const databricksGetScimGroup = tool({
  description: 'Get one SCIM group with members and entitlements.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    groupId: z.string().describe('SCIM group ID'),
  }),
  execute: async ({ databricksCredentials, groupId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/preview/scim/v2/Groups/${groupId}`,
      );
      if (!result.ok) return failedResult('Failed to get group', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting group');
    }
  },
});

export const databricksCreateScimGroup = tool({
  description: 'Create a workspace group with optional members and entitlements. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    group: z
      .record(z.string(), z.any())
      .describe('SCIM group: displayName, members [{value: userId}], entitlements [{value}]'),
  }),
  execute: async ({ databricksCredentials, group }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/preview/scim/v2/Groups', {
        method: 'POST',
        body: { schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'], ...group },
      });
      if (!result.ok) return failedResult('Failed to create group', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating group');
    }
  },
});

export const databricksDeleteScimGroup = tool({
  description: 'Delete a workspace group. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    groupId: z.string().describe('SCIM group ID'),
  }),
  execute: async ({ databricksCredentials, groupId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        `/2.0/preview/scim/v2/Groups/${groupId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete group', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting group');
    }
  },
});

export const databricksGetScimMe = tool({
  description:
    'Get the caller identity (user name, groups, entitlements). Use to verify the token.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/preview/scim/v2/Me');
      if (!result.ok) return failedResult('Failed to get caller identity', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting caller identity');
    }
  },
});

export const databricksListTokens = tool({
  description: 'List valid tokens for this user-workspace pair (metadata only).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/token/list');
      if (!result.ok) return failedResult('Failed to list tokens', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing tokens');
    }
  },
});

export const databricksCreateToken = tool({
  description:
    'Create a personal access token with comment, lifetime, and scopes. Store the secret now — it is shown once.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    comment: z.string().optional().describe('Token description'),
    lifetimeSeconds: z
      .number()
      .int()
      .optional()
      .describe('Lifetime in seconds (omit for workspace default)'),
    scopes: z.array(z.string()).optional().describe('Token scopes; omit for full access'),
  }),
  execute: async ({ databricksCredentials, comment, lifetimeSeconds, scopes }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/token/create', {
        method: 'POST',
        body: {
          ...(comment !== undefined ? { comment } : {}),
          ...(lifetimeSeconds !== undefined ? { lifetime_seconds: lifetimeSeconds } : {}),
          ...(scopes !== undefined ? { scopes } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create token', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating token');
    }
  },
});

export const databricksUpdateToken = tool({
  description: 'Update a token comment or scopes by token ID.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    tokenId: z.string().describe('Token ID'),
    comment: z.string().optional().describe('New comment'),
    scopes: z.array(z.string()).optional().describe('New scopes'),
  }),
  execute: async ({ databricksCredentials, tokenId, comment, scopes }) => {
    try {
      const result = await databricksRequest(databricksCredentials, `/2.0/token/${tokenId}`, {
        method: 'PATCH',
        body: {
          ...(comment !== undefined ? { comment } : {}),
          ...(scopes !== undefined ? { scopes } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update token', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating token');
    }
  },
});

export const databricksRevokeToken = tool({
  description: 'Revoke (delete) a personal access token by ID.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    tokenId: z.string().describe('Token ID'),
  }),
  execute: async ({ databricksCredentials, tokenId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/token/delete', {
        method: 'POST',
        body: { token_id: tokenId },
      });
      if (!result.ok) return failedResult('Failed to revoke token', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error revoking token');
    }
  },
});
