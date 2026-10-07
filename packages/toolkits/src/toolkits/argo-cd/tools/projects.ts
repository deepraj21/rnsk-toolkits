// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { argoCdRequest, failedResult, toArgoCdError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Argo CD credentials JSON with baseUrl (argocd-server URL) plus token, or username+password for local login',
  );

export const argoCdListProjects = tool({
  description: 'List AppProjects with sources, destinations, and roles summary.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/projects');
      if (!result.ok) return failedResult('Failed to list projects', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing projects');
    }
  },
});

export const argoCdGetProject = tool({
  description: 'Get one AppProject with full RBAC, sources, destinations, and windows.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
  }),
  execute: async ({ argoCdCredentials, projectName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/projects/${projectName}`);
      if (!result.ok) return failedResult('Failed to get project', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting project');
    }
  },
});

export const argoCdGetProjectDetailed = tool({
  description: 'Get an AppProject with live application counts per status.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
  }),
  execute: async ({ argoCdCredentials, projectName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/projects/${projectName}/detailed`);
      if (!result.ok) return failedResult('Failed to get detailed project', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting detailed project');
    }
  },
});

export const argoCdCreateProject = tool({
  description:
    'Create an AppProject: allowed sources/destinations, roles, sync windows, orphaned-resources handling.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    project: z
      .record(z.string(), z.any())
      .describe(
        'Project object: metadata {name}, spec {sourceRepos[], destinations [{server, namespace}], roles[], syncWindows[], orphanedResources}',
      ),
  }),
  execute: async ({ argoCdCredentials, project }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/projects', {
        method: 'POST',
        body: project,
      });
      if (!result.ok) return failedResult('Failed to create project', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error creating project');
    }
  },
});

export const argoCdUpdateProject = tool({
  description: 'Update an AppProject (sources, destinations, roles, windows).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
    project: z.record(z.string(), z.any()).describe('Project object with updated spec'),
  }),
  execute: async ({ argoCdCredentials, projectName, project }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/projects/${projectName}`, {
        method: 'PUT',
        body: project,
      });
      if (!result.ok) return failedResult('Failed to update project', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error updating project');
    }
  },
});

export const argoCdDeleteProject = tool({
  description: 'Delete an AppProject (apps are not deleted, they become unmanaged).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
  }),
  execute: async ({ argoCdCredentials, projectName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/projects/${projectName}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete project', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error deleting project');
    }
  },
});

export const argoCdGetProjectEvents = tool({
  description: 'List Kubernetes events for a project. Use to debug project issues.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
  }),
  execute: async ({ argoCdCredentials, projectName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/projects/${projectName}/events`);
      if (!result.ok) return failedResult('Failed to get project events', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting project events');
    }
  },
});

export const argoCdGetProjectSyncWindows = tool({
  description: 'List sync windows (allow/deny schedules) of a project.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
  }),
  execute: async ({ argoCdCredentials, projectName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/projects/${projectName}/syncwindows`);
      if (!result.ok) return failedResult('Failed to get project sync windows', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting project sync windows');
    }
  },
});

export const argoCdGetProjectLinks = tool({
  description: 'Get deep links configured for a project.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
  }),
  execute: async ({ argoCdCredentials, projectName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/projects/${projectName}/links`);
      if (!result.ok) return failedResult('Failed to get project links', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting project links');
    }
  },
});

export const argoCdCreateProjectToken = tool({
  description:
    'Create a project role token for CI automation with optional expiry. Store the token now — shown once.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
    role: z.string().describe('Project role name'),
    expiresIn: z.string().optional().describe('Expiry like "720h" (omit for non-expiring)'),
    tokenId: z.string().optional().describe('Token ID/description'),
  }),
  execute: async ({ argoCdCredentials, projectName, role, expiresIn, tokenId }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/projects/${projectName}/roles/${role}/token`,
        {
          method: 'POST',
          body: {
            ...(expiresIn !== undefined ? { expiresIn } : {}),
            ...(tokenId !== undefined ? { id: tokenId } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create project token', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error creating project token');
    }
  },
});

export const argoCdDeleteProjectToken = tool({
  description: 'Delete (revoke) a project role token by issued-at ID.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    projectName: z.string().describe('Project name'),
    role: z.string().describe('Project role name'),
    tokenIat: z.string().describe('Token issued-at ID from the token list'),
  }),
  execute: async ({ argoCdCredentials, projectName, role, tokenIat }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/projects/${projectName}/roles/${role}/token/${tokenIat}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete project token', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error deleting project token');
    }
  },
});

export const argoCdListAccounts = tool({
  description: 'List local accounts with capabilities and token IDs.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/account');
      if (!result.ok) return failedResult('Failed to list accounts', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing accounts');
    }
  },
});

export const argoCdGetAccount = tool({
  description: 'Get one account with capabilities and tokens.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    accountName: z.string().describe('Account name'),
  }),
  execute: async ({ argoCdCredentials, accountName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/account/${accountName}`);
      if (!result.ok) return failedResult('Failed to get account', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting account');
    }
  },
});

export const argoCdCheckPermission = tool({
  description:
    'Check whether the current account may perform an action (RBAC can-i). Use to pre-validate automation.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    resource: z.string().describe('Resource, e.g. applications, clusters, repositories'),
    action: z.string().describe('Action, e.g. get, create, update, delete, sync'),
    subresource: z.string().describe('Subresource or * for the resource itself'),
  }),
  execute: async ({ argoCdCredentials, resource, action, subresource }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/account/can-i/${resource}/${action}/${subresource}`,
      );
      if (!result.ok) return failedResult('Failed permission check', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error checking permission');
    }
  },
});

export const argoCdUpdatePassword = tool({
  description: 'Change the current account password (local accounts).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    currentPassword: z.string().describe('Current password'),
    newPassword: z.string().describe('New password'),
  }),
  execute: async ({ argoCdCredentials, currentPassword, newPassword }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/account/password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
      if (!result.ok) return failedResult('Failed to update password', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error updating password');
    }
  },
});

export const argoCdCreateAccountToken = tool({
  description:
    'Create an account token with optional expiry for automation. Store it now — shown once.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    accountName: z.string().describe('Account name'),
    expiresIn: z.string().optional().describe('Expiry like "720h" (omit for non-expiring)'),
    tokenId: z.string().optional().describe('Token ID/description'),
  }),
  execute: async ({ argoCdCredentials, accountName, expiresIn, tokenId }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/account/${accountName}/token`, {
        method: 'POST',
        body: {
          ...(expiresIn !== undefined ? { expiresIn } : {}),
          ...(tokenId !== undefined ? { id: tokenId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create account token', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error creating account token');
    }
  },
});

export const argoCdDeleteAccountToken = tool({
  description: 'Delete (revoke) an account token by ID.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    accountName: z.string().describe('Account name'),
    tokenId: z.string().describe('Token ID'),
  }),
  execute: async ({ argoCdCredentials, accountName, tokenId }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/account/${accountName}/token/${tokenId}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete account token', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error deleting account token');
    }
  },
});

export const argoCdListCertificates = tool({
  description: 'List configured repository TLS certificates (hosts and expiry).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/certificates');
      if (!result.ok) return failedResult('Failed to list certificates', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing certificates');
    }
  },
});

export const argoCdCreateCertificates = tool({
  description: 'Add repository TLS certificates (PEM data per host).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    certificates: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Certificates [{serverName, certType, certData (PEM), certSubType?}]'),
  }),
  execute: async ({ argoCdCredentials, certificates }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/certificates', {
        method: 'POST',
        body: { items: certificates },
      });
      if (!result.ok) return failedResult('Failed to create certificates', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error creating certificates');
    }
  },
});

export const argoCdDeleteCertificates = tool({
  description: 'Delete repository TLS certificates by host query.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    serverName: z.string().describe('Server host pattern to delete certs for'),
  }),
  execute: async ({ argoCdCredentials, serverName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/certificates', {
        method: 'DELETE',
        query: { serverName },
      });
      if (!result.ok) return failedResult('Failed to delete certificates', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error deleting certificates');
    }
  },
});

export const argoCdListGpgKeys = tool({
  description: 'List GPG public keys used for signature verification.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/gpgkeys');
      if (!result.ok) return failedResult('Failed to list GPG keys', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing GPG keys');
    }
  },
});

export const argoCdGetGpgKey = tool({
  description: 'Get one GPG public key by key ID.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    keyId: z.string().describe('GPG key ID'),
  }),
  execute: async ({ argoCdCredentials, keyId }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/gpgkeys/${keyId}`);
      if (!result.ok) return failedResult('Failed to get GPG key', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting GPG key');
    }
  },
});

export const argoCdCreateGpgKeys = tool({
  description: 'Add GPG public keys (armored key data) for commit signature verification.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    publicKeys: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Keys [{keyID?, keyData (armored)}]'),
  }),
  execute: async ({ argoCdCredentials, publicKeys }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/gpgkeys', {
        method: 'POST',
        body: { items: publicKeys },
      });
      if (!result.ok) return failedResult('Failed to create GPG keys', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error creating GPG keys');
    }
  },
});

export const argoCdDeleteGpgKeys = tool({
  description: 'Delete GPG public keys by key IDs.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    keyIds: z.array(z.string()).min(1).describe('GPG key IDs to delete'),
  }),
  execute: async ({ argoCdCredentials, keyIds }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/gpgkeys', {
        method: 'DELETE',
        body: { items: keyIds.map((keyID) => ({ keyID })) },
      });
      if (!result.ok) return failedResult('Failed to delete GPG keys', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error deleting GPG keys');
    }
  },
});
