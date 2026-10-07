// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { argoCdRequest, failedResult, toArgoCdError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Argo CD credentials JSON with baseUrl (argocd-server URL) plus token, or username+password for local login',
  );
const appNameField = z.string().describe('Application name');

export const argoCdLogin = tool({
  description:
    'Log in with a local username/password and receive a JWT. Prefer passing a token directly in credentials; use this to mint one.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      let parsed: { baseUrl?: string; serverUrl?: string; username?: string; password?: string };
      try {
        parsed = JSON.parse(argoCdCredentials);
      } catch {
        return {
          error: 'Failed to log in',
          statusCode: 400,
          details: { error: 'Invalid credentials JSON' },
        };
      }
      const server = (
        (parsed.baseUrl ?? parsed.serverUrl ?? '').trim().replace(/\/+$/, '') || ''
      ).replace(/^(?!https?:\/\/)/i, 'https://');
      if (!parsed.username || !parsed.password) {
        return {
          error: 'Failed to log in',
          statusCode: 401,
          details: {
            error:
              'Login needs {"baseUrl":"...","username":"...","password":"..."} (local accounts only).',
          },
        };
      }
      const response = await fetch(`${server}/api/v1/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: parsed.username, password: parsed.password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.token) {
        return { error: 'Failed to log in', statusCode: response.status, details: data };
      }
      return data;
    } catch (error) {
      return toArgoCdError(error, 'Error logging in');
    }
  },
});

export const argoCdGetUserInfo = tool({
  description:
    'Get the logged-in account info (username, groups, capabilities). Use to verify the token.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/session/userinfo');
      if (!result.ok) return failedResult('Failed to get user info', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting user info');
    }
  },
});

export const argoCdLogout = tool({
  description: 'Delete the current session (logout). Tokens remain valid until expiry.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/session', { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to log out', result);
      return result.data ?? { loggedOut: true };
    } catch (error) {
      return toArgoCdError(error, 'Error logging out');
    }
  },
});

export const argoCdGetVersion = tool({
  description: 'Get argocd-server version and build info. Use to check feature availability.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/version');
      if (!result.ok) return failedResult('Failed to get version', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting version');
    }
  },
});

export const argoCdGetSettings = tool({
  description: 'Get server settings (URL, dex config presence, status badge, feature flags).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/settings');
      if (!result.ok) return failedResult('Failed to get settings', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting settings');
    }
  },
});

export const argoCdGetSettingsPlugins = tool({
  description: 'List configured config-management plugins (CMP sidecars).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/settings/plugins');
      if (!result.ok) return failedResult('Failed to get settings plugins', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting settings plugins');
    }
  },
});

export const argoCdListNotificationServices = tool({
  description: 'List configured notification services (Slack, email, webhooks, ...).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/notifications/services');
      if (!result.ok) return failedResult('Failed to list notification services', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing notification services');
    }
  },
});

export const argoCdListNotificationTemplates = tool({
  description: 'List notification templates.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/notifications/templates');
      if (!result.ok) return failedResult('Failed to list notification templates', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing notification templates');
    }
  },
});

export const argoCdListNotificationTriggers = tool({
  description: 'List notification triggers (on-sync-succeeded, on-health-degraded, ...).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
  }),
  execute: async ({ argoCdCredentials }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/notifications/triggers');
      if (!result.ok) return failedResult('Failed to list notification triggers', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing notification triggers');
    }
  },
});

export const argoCdListApplications = tool({
  description:
    'List applications with sync/health status. Filter by project, name, repo, or refresh to bypass cache.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    project: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Project name(s) filter'),
    name: z.string().optional().describe('Application name filter'),
    repo: z.string().optional().describe('Repository URL filter'),
    refresh: z.boolean().optional().describe('Refresh cached data (hard refresh when true)'),
  }),
  execute: async ({ argoCdCredentials, project, name, repo, refresh }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/applications', {
        query: { project, name, repo, refresh: refresh === true ? 'true' : undefined },
      });
      if (!result.ok) return failedResult('Failed to list applications', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing applications');
    }
  },
});

export const argoCdGetApplication = tool({
  description:
    'Get one application with full spec, status, sync and health. Use refresh to bypass cache.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    refresh: z.boolean().optional().describe('Refresh cached data'),
  }),
  execute: async ({ argoCdCredentials, appName, refresh }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}`, {
        query: { refresh: refresh === true ? 'true' : undefined },
      });
      if (!result.ok) return failedResult('Failed to get application', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting application');
    }
  },
});

const appField = z
  .record(z.string(), z.any())
  .describe(
    'Application object: metadata {name, namespace?}, spec {project, source {repoURL, path?, targetRevision?, helm?, kustomize?}, destination {server, namespace}, syncPolicy {automated?, syncOptions?}}',
  );

export const argoCdCreateApplication = tool({
  description:
    'Create an application from a full spec (git/helm source, destination cluster, sync policy).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    application: appField,
    upsert: z.boolean().optional().describe('Update if the app already exists'),
  }),
  execute: async ({ argoCdCredentials, application, upsert }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, '/applications', {
        method: 'POST',
        query: { upsert: upsert === true ? true : undefined },
        body: application,
      });
      if (!result.ok) return failedResult('Failed to create application', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error creating application');
    }
  },
});

export const argoCdUpdateApplication = tool({
  description: 'Update an application spec (source revision, destination, sync policy).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    application: appField,
  }),
  execute: async ({ argoCdCredentials, appName, application }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}`, {
        method: 'PUT',
        body: application,
      });
      if (!result.ok) return failedResult('Failed to update application', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error updating application');
    }
  },
});

export const argoCdPatchApplication = tool({
  description: 'Patch an application with a JSON merge patch.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    patch: z.record(z.string(), z.any()).describe('JSON merge patch object'),
  }),
  execute: async ({ argoCdCredentials, appName, patch }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}`, {
        method: 'PATCH',
        body: patch,
      });
      if (!result.ok) return failedResult('Failed to patch application', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error patching application');
    }
  },
});

export const argoCdDeleteApplication = tool({
  description: 'Delete an application, optionally cascading to live resources.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    cascade: z.boolean().optional().describe('Delete live Kubernetes resources too'),
    propagationPolicy: z.string().optional().describe('Foreground, Background, or Orphan'),
  }),
  execute: async ({ argoCdCredentials, appName, cascade, propagationPolicy }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}`, {
        method: 'DELETE',
        query: {
          cascade: cascade === true ? true : undefined,
          propagationPolicy,
        },
      });
      if (!result.ok) return failedResult('Failed to delete application', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error deleting application');
    }
  },
});

export const argoCdSyncApplication = tool({
  description:
    'Sync an app to its target state: revision, prune, dry-run, strategy (apply/hook), resources, and sync options. The core GitOps deploy action.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    revision: z
      .string()
      .optional()
      .describe('Git revision/branch/tag/commit (default targetRevision)'),
    prune: z.boolean().optional().describe('Delete resources not in git'),
    dryRun: z.boolean().optional().describe('Preview without applying'),
    strategy: z
      .record(z.string(), z.any())
      .optional()
      .describe('Sync strategy, e.g. {hook:{}} for hooks-only'),
    resources: z
      .array(z.record(z.string(), z.any()))
      .optional()
      .describe('Selective sync resources [{group, kind, name, namespace}]'),
    syncOptions: z.array(z.string()).optional().describe('Sync options, e.g. CreateNamespace=true'),
  }),
  execute: async ({
    argoCdCredentials,
    appName,
    revision,
    prune,
    dryRun,
    strategy,
    resources,
    syncOptions,
  }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/sync`, {
        method: 'POST',
        body: {
          ...(revision !== undefined ? { revision } : {}),
          ...(prune !== undefined ? { prune } : {}),
          ...(dryRun !== undefined ? { dryRun } : {}),
          ...(strategy !== undefined ? { strategy } : {}),
          ...(resources !== undefined ? { resources } : {}),
          ...(syncOptions !== undefined ? { syncOptions: { items: syncOptions } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to sync application', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error syncing application');
    }
  },
});

export const argoCdTerminateSyncOperation = tool({
  description: 'Terminate an in-progress sync or other operation on an app.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
  }),
  execute: async ({ argoCdCredentials, appName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/operation`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to terminate operation', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error terminating operation');
    }
  },
});

export const argoCdRollbackApplication = tool({
  description: 'Roll back an app to a previous deployment history ID.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    historyId: z.number().int().describe('Deployment history ID from app history'),
    prune: z.boolean().optional().describe('Prune resources not in the rollback target'),
    dryRun: z.boolean().optional().describe('Preview without applying'),
  }),
  execute: async ({ argoCdCredentials, appName, historyId, prune, dryRun }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/rollback`, {
        method: 'POST',
        body: {
          id: historyId,
          ...(prune !== undefined ? { prune } : {}),
          ...(dryRun !== undefined ? { dryRun } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to roll back application', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error rolling back application');
    }
  },
});

export const argoCdGetResourceTree = tool({
  description: 'Get the live resource tree of an app with per-resource health and sync states.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
  }),
  execute: async ({ argoCdCredentials, appName }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/applications/${appName}/resource-tree`,
      );
      if (!result.ok) return failedResult('Failed to get resource tree', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting resource tree');
    }
  },
});

export const argoCdGetManagedResources = tool({
  description: 'List resources managed by an app with live state summaries.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
  }),
  execute: async ({ argoCdCredentials, appName }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/applications/${appName}/managed-resources`,
      );
      if (!result.ok) return failedResult('Failed to get managed resources', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting managed resources');
    }
  },
});

export const argoCdGetManifests = tool({
  description: 'Get rendered manifests of an app at a revision.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    revision: z.string().optional().describe('Git revision (default targetRevision)'),
  }),
  execute: async ({ argoCdCredentials, appName, revision }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/manifests`, {
        query: { revision },
      });
      if (!result.ok) return failedResult('Failed to get manifests', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting manifests');
    }
  },
});

export const argoCdGetServerSideDiff = tool({
  description: 'Dry-run server-side diff of an app against a revision to preview drift.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
  }),
  execute: async ({ argoCdCredentials, appName }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/applications/${appName}/server-side-diff`,
      );
      if (!result.ok) return failedResult('Failed to get server-side diff', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting server-side diff');
    }
  },
});

export const argoCdGetAppEvents = tool({
  description: 'List Kubernetes events for an app resources. Use to debug deploys.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
  }),
  execute: async ({ argoCdCredentials, appName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/events`);
      if (!result.ok) return failedResult('Failed to get app events', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting app events');
    }
  },
});

export const argoCdGetAppLinks = tool({
  description: 'Get deep links (dashboards, logs) configured for an app.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
  }),
  execute: async ({ argoCdCredentials, appName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/links`);
      if (!result.ok) return failedResult('Failed to get app links', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting app links');
    }
  },
});

export const argoCdGetAppLogs = tool({
  description: 'Get pod logs for an app pods (namespace/pod/container selectors, tail lines).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    namespace: z.string().optional().describe('Pod namespace'),
    podName: z.string().optional().describe('Pod name filter'),
    container: z.string().optional().describe('Container name'),
    tailLines: z.number().int().min(1).optional().describe('Tail N lines'),
    sinceSeconds: z.number().int().min(1).optional().describe('Only logs since N seconds ago'),
  }),
  execute: async ({
    argoCdCredentials,
    appName,
    namespace,
    podName,
    container,
    tailLines,
    sinceSeconds,
  }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/logs`, {
        query: {
          namespace,
          podName,
          container,
          tailLines,
          sinceSeconds,
        },
      });
      if (!result.ok) return failedResult('Failed to get app logs', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting app logs');
    }
  },
});

export const argoCdGetAppSyncWindows = tool({
  description: 'List sync windows (allow/deny with schedules) applying to an app.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
  }),
  execute: async ({ argoCdCredentials, appName }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/syncwindows`);
      if (!result.ok) return failedResult('Failed to get app sync windows', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting app sync windows');
    }
  },
});

export const argoCdGetResource = tool({
  description: 'Get live state of one managed resource (group/kind/namespace/name).',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    namespace: z.string().optional().describe('Resource namespace'),
    resourceName: z.string().describe('Resource name'),
    kind: z.string().describe('Resource kind, e.g. Deployment'),
    group: z.string().optional().describe('API group (empty for core)'),
    version: z.string().optional().describe('API version, e.g. v1, apps/v1'),
  }),
  execute: async ({
    argoCdCredentials,
    appName,
    namespace,
    resourceName,
    kind,
    group,
    version,
  }) => {
    try {
      const result = await argoCdRequest(argoCdCredentials, `/applications/${appName}/resource`, {
        query: { namespace, resourceName, kind, group, version },
      });
      if (!result.ok) return failedResult('Failed to get resource', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error getting resource');
    }
  },
});

export const argoCdListResourceActions = tool({
  description: 'List available resource actions (restart, resume, ...) for one managed resource.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    namespace: z.string().optional().describe('Resource namespace'),
    resourceName: z.string().describe('Resource name'),
    kind: z.string().describe('Resource kind'),
    group: z.string().optional().describe('API group'),
    version: z.string().optional().describe('API version'),
  }),
  execute: async ({
    argoCdCredentials,
    appName,
    namespace,
    resourceName,
    kind,
    group,
    version,
  }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/applications/${appName}/resource/actions`,
        {
          query: { namespace, resourceName, kind, group, version },
        },
      );
      if (!result.ok) return failedResult('Failed to list resource actions', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error listing resource actions');
    }
  },
});

export const argoCdRunResourceAction = tool({
  description:
    'Run a resource action (e.g. restart a Deployment, resume a Rollout) on a live resource.',
  inputSchema: z.object({
    argoCdCredentials: credentialsField,
    appName: appNameField,
    namespace: z.string().optional().describe('Resource namespace'),
    resourceName: z.string().describe('Resource name'),
    kind: z.string().describe('Resource kind'),
    group: z.string().optional().describe('API group'),
    action: z.string().describe('Action name, e.g. restart'),
  }),
  execute: async ({ argoCdCredentials, appName, namespace, resourceName, kind, group, action }) => {
    try {
      const result = await argoCdRequest(
        argoCdCredentials,
        `/applications/${appName}/resource/actions`,
        {
          method: 'POST',
          body: {
            namespace,
            resourceName,
            kind,
            ...(group !== undefined ? { group } : {}),
            action,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to run resource action', result);
      return result.data;
    } catch (error) {
      return toArgoCdError(error, 'Error running resource action');
    }
  },
});
