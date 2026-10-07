// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { synkRest, failedResult, toSynkError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Synk credentials JSON with apiKey (Snyk API token) and optional baseUrl for the region (default https://api.snyk.io)',
  );
const orgIdField = z.string().describe('Organization ID (UUID from Organization Settings)');
const versionField = z
  .string()
  .optional()
  .describe('REST API version date, e.g. 2024-10-15 (defaults to 2024-10-15)');

export const synkInviteUser = tool({
  description: 'Invite a user to an organization by email with a role.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    email: z.string().describe('Invitee email'),
    role: z.string().optional().describe('Role, e.g. collaborator'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, email, role, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/invites`, {
        method: 'POST',
        version,
        body: {
          data: {
            type: 'invite',
            attributes: {
              email,
              ...(role !== undefined ? { role } : {}),
            },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to invite user', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error inviting user');
    }
  },
});

export const synkListInvites = tool({
  description: 'List pending user invitations of an organization.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/invites`, { version });
      if (!result.ok) return failedResult('Failed to list invites', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing invites');
    }
  },
});

export const synkCancelInvite = tool({
  description: 'Cancel a pending user invitation.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    inviteId: z.string().describe('Invite ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, inviteId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/invites/${inviteId}`, {
        method: 'DELETE',
        version,
      });
      if (!result.ok) return failedResult('Failed to cancel invite', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error canceling invite');
    }
  },
});

export const synkSearchOrgAuditLogs = tool({
  description:
    'Search organization audit logs by time range, users, projects, and event types. Use for compliance and forensics.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    from: z.string().optional().describe('Range start ISO datetime'),
    to: z.string().optional().describe('Range end ISO datetime'),
    userId: z.string().optional().describe('Filter by user ID'),
    projectId: z.string().optional().describe('Filter by project ID'),
    events: z.string().optional().describe('Comma-separated event types to include'),
    excludeEvents: z.string().optional().describe('Comma-separated event types to exclude'),
    size: z.number().int().min(1).optional().describe('Results per page'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version, ...f }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/audit_logs/search`, {
        version,
        query: {
          from: f.from,
          to: f.to,
          user_id: f.userId,
          project_id: f.projectId,
          events: f.events,
          exclude_events: f.excludeEvents,
          size: f.size,
          sort_order: f.sortOrder,
        },
      });
      if (!result.ok) return failedResult('Failed to search org audit logs', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error searching org audit logs');
    }
  },
});

export const synkSearchGroupAuditLogs = tool({
  description: 'Search group audit logs by time range, users, and event types.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    from: z.string().optional().describe('Range start ISO datetime'),
    to: z.string().optional().describe('Range end ISO datetime'),
    userId: z.string().optional().describe('Filter by user ID'),
    events: z.string().optional().describe('Comma-separated event types to include'),
    excludeEvents: z.string().optional().describe('Comma-separated event types to exclude'),
    size: z.number().int().min(1).optional().describe('Results per page'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, version, ...f }) => {
    try {
      const result = await synkRest(synkCredentials, `/groups/${groupId}/audit_logs/search`, {
        version,
        query: {
          from: f.from,
          to: f.to,
          user_id: f.userId,
          events: f.events,
          exclude_events: f.excludeEvents,
          size: f.size,
          sort_order: f.sortOrder,
        },
      });
      if (!result.ok) return failedResult('Failed to search group audit logs', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error searching group audit logs');
    }
  },
});

export const synkListServiceAccounts = tool({
  description: 'List service accounts owned by an organization.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/service_accounts`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to list service accounts', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing service accounts');
    }
  },
});

export const synkCreateServiceAccount = tool({
  description:
    'Create a service account for automation (API key or OAuth client auth). Returns credentials once — store them immediately.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    name: z.string().describe('Service account name'),
    role: z.string().optional().describe('Role, e.g. viewer'),
    authType: z.string().optional().describe('Auth strategy: api_key or oauth_client_secret'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, name, role, authType, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/service_accounts`, {
        method: 'POST',
        version,
        body: {
          data: {
            type: 'service_account',
            attributes: {
              name,
              ...(role !== undefined ? { role } : {}),
              ...(authType !== undefined ? { auth_type: authType } : {}),
            },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create service account', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating service account');
    }
  },
});

export const synkGetServiceAccount = tool({
  description: 'Get one service account.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    serviceAccountId: z.string().describe('Service account ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, serviceAccountId, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/service_accounts/${serviceAccountId}`,
        { version },
      );
      if (!result.ok) return failedResult('Failed to get service account', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting service account');
    }
  },
});

export const synkUpdateServiceAccount = tool({
  description: 'Update a service account name or role.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    serviceAccountId: z.string().describe('Service account ID'),
    name: z.string().optional().describe('New name'),
    role: z.string().optional().describe('New role'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, serviceAccountId, name, role, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/service_accounts/${serviceAccountId}`,
        {
          method: 'PATCH',
          version,
          body: {
            data: {
              type: 'service_account',
              id: serviceAccountId,
              attributes: {
                ...(name !== undefined ? { name } : {}),
                ...(role !== undefined ? { role } : {}),
              },
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update service account', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating service account');
    }
  },
});

export const synkDeleteServiceAccount = tool({
  description: 'Delete a service account and revoke its credentials.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    serviceAccountId: z.string().describe('Service account ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, serviceAccountId, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/service_accounts/${serviceAccountId}`,
        { method: 'DELETE', version },
      );
      if (!result.ok) return failedResult('Failed to delete service account', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting service account');
    }
  },
});

export const synkCreateServiceAccountSecret = tool({
  description: 'Create a new secret (API key or OAuth secret) for a service account.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    serviceAccountId: z.string().describe('Service account ID'),
    name: z.string().optional().describe('Secret name'),
    expiresAt: z.string().optional().describe('Expiry ISO datetime'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, serviceAccountId, name, expiresAt, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/service_accounts/${serviceAccountId}/secrets`,
        {
          method: 'POST',
          version,
          body: {
            data: {
              type: 'secret',
              attributes: {
                ...(name !== undefined ? { name } : {}),
                ...(expiresAt !== undefined ? { expires_at: expiresAt } : {}),
              },
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create service account secret', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating service account secret');
    }
  },
});

export const synkListOrgApps = tool({
  description: 'List apps created by an organization.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/apps`, { version });
      if (!result.ok) return failedResult('Failed to list org apps', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing org apps');
    }
  },
});

export const synkListOrgInstalls = tool({
  description: 'List apps installed in an organization.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/apps/installs`, { version });
      if (!result.ok) return failedResult('Failed to list org app installs', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing org app installs');
    }
  },
});

export const synkInstallOrgApp = tool({
  description: 'Install an app into an organization.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    clientId: z.string().describe('App client ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, clientId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/apps/installs`, {
        method: 'POST',
        version,
        body: { data: { type: 'app_install', attributes: { client_id: clientId } } },
      });
      if (!result.ok) return failedResult('Failed to install org app', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error installing org app');
    }
  },
});

export const synkRevokeOrgAppInstall = tool({
  description: 'Revoke an app installation in an organization by install ID.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    installId: z.string().describe('Install ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, installId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/apps/installs/${installId}`, {
        method: 'DELETE',
        version,
      });
      if (!result.ok) return failedResult('Failed to revoke org app install', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error revoking org app install');
    }
  },
});

export const synkGetSelf = tool({
  description: 'Get the token owner identity. Use to verify the API token.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, version }) => {
    try {
      const result = await synkRest(synkCredentials, '/self', { version });
      if (!result.ok) return failedResult('Failed to get identity', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting identity');
    }
  },
});

export const synkListPersonalAccessTokens = tool({
  description: 'List personal access tokens of the token owner (metadata only).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, version }) => {
    try {
      const result = await synkRest(synkCredentials, '/self/personal_access_tokens', { version });
      if (!result.ok) return failedResult('Failed to list personal access tokens', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing personal access tokens');
    }
  },
});

export const synkDeletePersonalAccessToken = tool({
  description: 'Revoke a personal access token by ID.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    tokenId: z.string().describe('Personal access token ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, tokenId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/self/personal_access_tokens/${tokenId}`, {
        method: 'DELETE',
        version,
      });
      if (!result.ok) return failedResult('Failed to delete personal access token', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting personal access token');
    }
  },
});
