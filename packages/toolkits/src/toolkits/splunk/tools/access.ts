// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { missingCredentialsError, splunkEntries, splunkRequest } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

export const splunkListUsers = tool({
  description: 'List Splunk users with roles, email and real name. Use to audit access and find search owners.',
  inputSchema: z.object({
    splunkCredentials: authField,
    count: z.number().int().min(1).max(1000).optional().describe('Max users to return (default 100)'),
  }),
  execute: async ({ splunkCredentials, count }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, '/services/authentication/users', {
        query: { count: count ?? 100 },
      });
      const users = splunkEntries(data).map((e) => ({
        name: e.name,
        realName: (e.content as Record<string, unknown> | undefined)?.realname,
        email: (e.content as Record<string, unknown> | undefined)?.email,
        roles: (e.content as Record<string, unknown> | undefined)?.roles,
      }));
      return { count: users.length, users };
    } catch (error) {
      return { error: 'Failed to list users', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkListRoles = tool({
  description: 'List Splunk roles with capabilities, default app and inherited roles. Use to audit permissions.',
  inputSchema: z.object({ splunkCredentials: authField }),
  execute: async ({ splunkCredentials }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, '/services/authorization/roles');
      const roles = splunkEntries(data).map((e) => ({
        name: e.name,
        capabilities: (e.content as Record<string, unknown> | undefined)?.capabilities,
        defaultApp: (e.content as Record<string, unknown> | undefined)?.defaultApp,
        importedRoles: (e.content as Record<string, unknown> | undefined)?.imported_roles,
      }));
      return { count: roles.length, roles };
    } catch (error) {
      return { error: 'Failed to list roles', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkListFiredAlerts = tool({
  description: 'List fired alert instances with severity and trigger time. Use to triage recent alert firings.',
  inputSchema: z.object({
    splunkCredentials: authField,
    savedSearchName: z.string().optional().describe('Limit to alerts from this saved search'),
    count: z.number().int().min(1).max(1000).optional().describe('Max alerts to return (default 30)'),
  }),
  execute: async ({ splunkCredentials, savedSearchName, count }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const path = savedSearchName
        ? `/services/alerts/fired_alerts/${encodeURIComponent(savedSearchName)}`
        : '/services/alerts/fired_alerts';
      const data = await splunkRequest(splunkCredentials, path, { query: { count: count ?? 30 } });
      const alerts = splunkEntries(data).map((e) => ({
        name: e.name,
        savedSearch: (e.content as Record<string, unknown> | undefined)?.savedsearch_name,
        severity: (e.content as Record<string, unknown> | undefined)?.severity,
        triggerTime: (e.content as Record<string, unknown> | undefined)?.trigger_time_rendered,
        sid: (e.content as Record<string, unknown> | undefined)?.sid,
      }));
      return { count: alerts.length, alerts };
    } catch (error) {
      return { error: 'Failed to list fired alerts', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkGetServerInfo = tool({
  description: 'Get server info: version, build, GUID, roles and license state. Use to check deployment health and version.',
  inputSchema: z.object({ splunkCredentials: authField }),
  execute: async ({ splunkCredentials }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, '/services/server/info');
      const entry = splunkEntries(data)[0];
      const c = (entry?.content ?? {}) as Record<string, unknown>;
      return {
        serverName: c.serverName,
        version: c.version,
        build: c.build,
        guid: c.guid,
        serverRoles: c.server_roles,
        licenseState: c.license_state,
        numberOfCores: c.numberOfCores,
        physicalMemoryMB: c.physicalMemoryMB,
      };
    } catch (error) {
      return { error: 'Failed to get server info', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
