// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jfrogRequest, failedResult, toJfrogError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'JFrog credentials JSON with baseUrl (Platform URL, e.g. https://mycompany.jfrog.io) plus accessToken, apiKey, or username+password',
  );

export const jfrogCreateAccessToken = tool({
  description:
    'Create a scoped access token via the Platform Access API (JSON). Use for CI jobs and integrations with least-privilege scopes.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    username: z.string().optional().describe('Subject user (defaults to caller)'),
    scope: z
      .string()
      .optional()
      .describe(
        'Space-separated scopes, e.g. "applied-permissions/admin artifact:libs-release-local/**:r"',
      ),
    expiresIn: z.number().int().optional().describe('Expiry in seconds; 0 means non-expiring'),
    refreshable: z.boolean().optional().describe('Whether the token is refreshable'),
    description: z.string().optional().describe('Token description for auditing'),
  }),
  execute: async ({ jfrogCredentials, username, scope, expiresIn, refreshable, description }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'access', '/v1/tokens', {
        method: 'POST',
        body: {
          ...(username !== undefined ? { username } : {}),
          ...(scope !== undefined ? { scope } : {}),
          ...(expiresIn !== undefined ? { expires_in: expiresIn } : {}),
          ...(refreshable !== undefined ? { refreshable } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create access token', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error creating access token');
    }
  },
});

export const jfrogGetAccessToken = tool({
  description: 'Get an access token record by ID (metadata only — never the secret).',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    tokenId: z.string().describe('Token ID (the token_id field from creation)'),
  }),
  execute: async ({ jfrogCredentials, tokenId }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'access', `/v1/tokens/${tokenId}`);
      if (!result.ok) return failedResult('Failed to get access token', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting access token');
    }
  },
});

export const jfrogRefreshAccessToken = tool({
  description: 'Refresh a refreshable access token pair and receive new tokens.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    refreshToken: z.string().describe('Refresh token from a refreshable token pair'),
    accessToken: z.string().optional().describe('Expiring access token to refresh'),
  }),
  execute: async ({ jfrogCredentials, refreshToken, accessToken }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'access', '/v1/tokens/refresh', {
        method: 'POST',
        body: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          ...(accessToken !== undefined ? { access_token: accessToken } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to refresh access token', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error refreshing access token');
    }
  },
});

export const jfrogRevokeAccessToken = tool({
  description: 'Revoke an access token by ID. The token stops working immediately.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    tokenId: z.string().describe('Token ID to revoke'),
  }),
  execute: async ({ jfrogCredentials, tokenId }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'access', `/v1/tokens/${tokenId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to revoke access token', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error revoking access token');
    }
  },
});

export const jfrogListProjects = tool({
  description: 'List JFrog Platform projects with keys, display names, and storage quotas.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'access', '/v1/projects');
      if (!result.ok) return failedResult('Failed to list projects', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing projects');
    }
  },
});

export const jfrogGetProject = tool({
  description: 'Get one project by key: description, admins, roles, repos, and quotas.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    projectKey: z.string().describe('Project key'),
  }),
  execute: async ({ jfrogCredentials, projectKey }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'access', `/v1/projects/${projectKey}`);
      if (!result.ok) return failedResult('Failed to get project', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting project');
    }
  },
});

export const jfrogAssignProjectUser = tool({
  description:
    'Assign a user to a project with roles (Viewer/Developer/Maintainer/Project Admin/Release Manager).',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    projectKey: z.string().describe('Project key'),
    username: z.string().describe('Username to assign'),
    roles: z.array(z.string()).min(1).describe('Project roles, e.g. ["Developer"]'),
  }),
  execute: async ({ jfrogCredentials, projectKey, username, roles }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'access',
        `/v1/projects/${projectKey}/users/${username}`,
        { method: 'PUT', body: { roles } },
      );
      if (!result.ok) return failedResult('Failed to assign project user', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error assigning project user');
    }
  },
});

export const jfrogAssignProjectGroup = tool({
  description: 'Assign a group to a project with roles.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    projectKey: z.string().describe('Project key'),
    groupName: z.string().describe('Group name to assign'),
    roles: z.array(z.string()).min(1).describe('Project roles, e.g. ["Viewer"]'),
  }),
  execute: async ({ jfrogCredentials, projectKey, groupName, roles }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'access',
        `/v1/projects/${projectKey}/groups/${groupName}`,
        { method: 'PUT', body: { roles } },
      );
      if (!result.ok) return failedResult('Failed to assign project group', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error assigning project group');
    }
  },
});

export const jfrogRemoveProjectUser = tool({
  description: 'Remove a user from a project.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    projectKey: z.string().describe('Project key'),
    username: z.string().describe('Username to remove'),
  }),
  execute: async ({ jfrogCredentials, projectKey, username }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'access',
        `/v1/projects/${projectKey}/users/${username}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to remove project user', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error removing project user');
    }
  },
});

export const jfrogRemoveProjectGroup = tool({
  description: 'Remove a group from a project.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    projectKey: z.string().describe('Project key'),
    groupName: z.string().describe('Group name to remove'),
  }),
  execute: async ({ jfrogCredentials, projectKey, groupName }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'access',
        `/v1/projects/${projectKey}/groups/${groupName}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to remove project group', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error removing project group');
    }
  },
});

export const jfrogListWebhooks = tool({
  description: 'List Event webhook subscriptions with keys, event types, and handlers.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
  }),
  execute: async ({ jfrogCredentials }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'event', '/v1/subscriptions');
      if (!result.ok) return failedResult('Failed to list webhooks', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error listing webhooks');
    }
  },
});

export const jfrogGetWebhook = tool({
  description: 'Get one webhook subscription: criteria, handlers, and retry config.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    webhookKey: z.string().describe('Webhook subscription key'),
  }),
  execute: async ({ jfrogCredentials, webhookKey }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'event',
        `/v1/subscriptions/${webhookKey}`,
      );
      if (!result.ok) return failedResult('Failed to get webhook', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error getting webhook');
    }
  },
});

export const jfrogCreateWebhook = tool({
  description:
    'Create an Event webhook subscription (key, event types, criteria, handlers such as webhook URL or email).',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    webhook: z
      .record(z.string(), z.any())
      .describe(
        'Webhook object: key, event_types (string[]), criteria {any_build, selected_repos,...}, handlers [{type, url,...}]',
      ),
  }),
  execute: async ({ jfrogCredentials, webhook }) => {
    try {
      const result = await jfrogRequest(jfrogCredentials, 'event', '/v1/subscriptions', {
        method: 'POST',
        body: webhook,
      });
      if (!result.ok) return failedResult('Failed to create webhook', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error creating webhook');
    }
  },
});

export const jfrogUpdateWebhook = tool({
  description: 'Fully replace a webhook subscription configuration by key.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    webhookKey: z.string().describe('Webhook subscription key'),
    webhook: z.record(z.string(), z.any()).describe('Full webhook object (replaces existing)'),
  }),
  execute: async ({ jfrogCredentials, webhookKey, webhook }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'event',
        `/v1/subscriptions/${webhookKey}`,
        {
          method: 'PUT',
          body: webhook,
        },
      );
      if (!result.ok) return failedResult('Failed to update webhook', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error updating webhook');
    }
  },
});

export const jfrogDeleteWebhook = tool({
  description: 'Delete a webhook subscription by key.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    webhookKey: z.string().describe('Webhook subscription key'),
  }),
  execute: async ({ jfrogCredentials, webhookKey }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'event',
        `/v1/subscriptions/${webhookKey}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete webhook', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error deleting webhook');
    }
  },
});

export const jfrogTestWebhook = tool({
  description: 'Send a test event to a webhook subscription to verify handler URLs and payloads.',
  inputSchema: z.object({
    jfrogCredentials: credentialsField,
    webhookKey: z.string().describe('Webhook subscription key'),
  }),
  execute: async ({ jfrogCredentials, webhookKey }) => {
    try {
      const result = await jfrogRequest(
        jfrogCredentials,
        'event',
        `/v1/subscriptions/${webhookKey}/test`,
        { method: 'POST', body: {} },
      );
      if (!result.ok) return failedResult('Failed to test webhook', result);
      return result.data;
    } catch (error) {
      return toJfrogError(error, 'Error testing webhook');
    }
  },
});
