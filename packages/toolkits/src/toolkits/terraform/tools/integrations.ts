// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pageParams, terraformRequest, toTerraformError } from './client.js';

const tokenField = z
  .string()
  .optional()
  .describe(
    'Injected Terraform API token (user, team, or organization token) — match manifest tokenField',
  );
const orgField = z.string().describe('Organization name');

export const listAgentPools = tool({
  description: 'List agent pools for remote execution via HCP Terraform agents.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/agent-pools`,
        {
          query: pageParams(pageNumber, pageSize),
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform agent pools', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform agent pools');
    }
  },
});

export const getAgentPool = tool({
  description: 'Get an agent pool by ID with organization scope and agent count.',
  inputSchema: z.object({
    terraformToken: tokenField,
    agentPoolId: z.string().describe('Agent pool ID, e.g. "apool-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, agentPoolId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/agent-pools/${encodeURIComponent(agentPoolId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform agent pool "${agentPoolId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform agent pool "${agentPoolId}"`);
    }
  },
});

export const listOAuthClients = tool({
  description: 'List VCS OAuth clients (GitHub, GitLab, Bitbucket, Azure DevOps connections).',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: orgField,
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({ terraformToken, organization, pageNumber, pageSize }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/oauth-clients`,
        {
          query: pageParams(pageNumber, pageSize),
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform OAuth clients', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform OAuth clients');
    }
  },
});

export const getOAuthClient = tool({
  description: 'Get a VCS OAuth client by ID with service provider and callback URL.',
  inputSchema: z.object({
    terraformToken: tokenField,
    oauthClientId: z.string().describe('OAuth client ID, e.g. "oc-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, oauthClientId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/oauth-clients/${encodeURIComponent(oauthClientId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform OAuth client "${oauthClientId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform OAuth client "${oauthClientId}"`);
    }
  },
});

export const listNotificationConfigs = tool({
  description: 'List notification configurations (Slack, email, generic webhooks) on a workspace.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: z.string().describe('Workspace ID'),
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/notification-configurations`,
      );
      if (!result.ok)
        return failedResult('Failed to list Terraform notification configurations', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform notification configurations');
    }
  },
});

export const getNotificationConfig = tool({
  description: 'Get a notification configuration by ID with triggers and deliveries.',
  inputSchema: z.object({
    terraformToken: tokenField,
    notificationConfigId: z
      .string()
      .describe('Notification configuration ID, e.g. "nc-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, notificationConfigId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/notification-configurations/${encodeURIComponent(notificationConfigId)}`,
      );
      if (!result.ok)
        return failedResult(
          `Failed to get Terraform notification configuration "${notificationConfigId}"`,
          result,
        );
      return result.data;
    } catch (error) {
      return toTerraformError(
        error,
        `Error getting Terraform notification configuration "${notificationConfigId}"`,
      );
    }
  },
});

export const createNotificationConfig = tool({
  description:
    'Create a workspace notification (Slack/email/generic) for run events like needs-attention or always.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: z.string().describe('Workspace ID'),
    name: z.string().describe('Notification name, e.g. "deploys channel"'),
    destinationType: z.enum(['generic', 'email', 'slack']).describe('Destination type'),
    url: z.string().optional().describe('Webhook URL (generic and slack types)'),
    emailAddresses: z.array(z.string()).optional().describe('Recipients (email type)'),
    triggers: z
      .array(z.string())
      .optional()
      .describe('Events, e.g. ["run:needs_attention","run:errored"]. Omit for all events.'),
    enabled: z.boolean().optional().describe('Enable immediately (default true)'),
  }),
  execute: async ({
    terraformToken,
    workspaceId,
    name,
    destinationType,
    url,
    emailAddresses,
    triggers,
    enabled,
  }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/notification-configurations`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'notification-configurations',
              attributes: {
                name,
                'destination-type': destinationType,
                url,
                'email-addresses': emailAddresses,
                triggers,
                enabled,
              },
            },
          },
        },
      );
      if (!result.ok)
        return failedResult('Failed to create Terraform notification configuration', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform notification configuration');
    }
  },
});

export const updateNotificationConfig = tool({
  description: 'Update a notification configuration name, URL, triggers, or enabled flag.',
  inputSchema: z.object({
    terraformToken: tokenField,
    notificationConfigId: z.string().describe('Notification configuration ID to update'),
    name: z.string().optional().describe('New name'),
    url: z.string().optional().describe('New webhook URL'),
    enabled: z.boolean().optional().describe('Enable or disable'),
    triggers: z.array(z.string()).optional().describe('Replacement trigger list'),
  }),
  execute: async ({ terraformToken, notificationConfigId, name, url, enabled, triggers }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/notification-configurations/${encodeURIComponent(notificationConfigId)}`,
        {
          method: 'PATCH',
          body: {
            data: {
              type: 'notification-configurations',
              attributes: { name, url, enabled, triggers },
            },
          },
        },
      );
      if (!result.ok)
        return failedResult(
          `Failed to update Terraform notification configuration "${notificationConfigId}"`,
          result,
        );
      return result.data;
    } catch (error) {
      return toTerraformError(
        error,
        `Error updating Terraform notification configuration "${notificationConfigId}"`,
      );
    }
  },
});

export const deleteNotificationConfig = tool({
  description: 'Delete a notification configuration from a workspace.',
  inputSchema: z.object({
    terraformToken: tokenField,
    notificationConfigId: z.string().describe('Notification configuration ID to delete'),
  }),
  execute: async ({ terraformToken, notificationConfigId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/notification-configurations/${encodeURIComponent(notificationConfigId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(
          `Failed to delete Terraform notification configuration "${notificationConfigId}"`,
          result,
        );
      return { success: true, notificationConfigId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(
        error,
        `Error deleting Terraform notification configuration "${notificationConfigId}"`,
      );
    }
  },
});

export const verifyNotificationConfig = tool({
  description: 'Send a test notification to verify a configuration delivers correctly.',
  inputSchema: z.object({
    terraformToken: tokenField,
    notificationConfigId: z.string().describe('Notification configuration ID to verify'),
  }),
  execute: async ({ terraformToken, notificationConfigId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/notification-configurations/${encodeURIComponent(notificationConfigId)}/actions/verify`,
        { method: 'POST' },
      );
      if (!result.ok)
        return failedResult('Failed to verify Terraform notification configuration', result);
      return result.data ?? { success: true, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, 'Error verifying Terraform notification configuration');
    }
  },
});

export const listRunTriggers = tool({
  description:
    'List run triggers that queue runs in this workspace when the source workspace applies.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: z.string().describe('Workspace ID'),
  }),
  execute: async ({ terraformToken, workspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/run-triggers`,
      );
      if (!result.ok) return failedResult('Failed to list Terraform run triggers', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform run triggers');
    }
  },
});

export const getRunTrigger = tool({
  description: 'Get a run trigger by ID with source workspace info.',
  inputSchema: z.object({
    terraformToken: tokenField,
    runTriggerId: z.string().describe('Run trigger ID, e.g. "rt-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, runTriggerId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/run-triggers/${encodeURIComponent(runTriggerId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform run trigger "${runTriggerId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform run trigger "${runTriggerId}"`);
    }
  },
});

export const createRunTrigger = tool({
  description: 'Create a run trigger so applies in a source workspace queue runs here.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: z.string().describe('Workspace that will get triggered runs'),
    sourceWorkspaceId: z.string().describe('Source workspace whose applies trigger runs'),
  }),
  execute: async ({ terraformToken, workspaceId, sourceWorkspaceId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/workspaces/${encodeURIComponent(workspaceId)}/run-triggers`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'run-triggers',
              attributes: {},
              relationships: {
                sourceable: { data: { type: 'workspaces', id: sourceWorkspaceId } },
              },
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create Terraform run trigger', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform run trigger');
    }
  },
});

export const deleteRunTrigger = tool({
  description: 'Delete a run trigger to stop cross-workspace run chaining.',
  inputSchema: z.object({
    terraformToken: tokenField,
    runTriggerId: z.string().describe('Run trigger ID to delete'),
  }),
  execute: async ({ terraformToken, runTriggerId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/run-triggers/${encodeURIComponent(runTriggerId)}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to delete Terraform run trigger "${runTriggerId}"`, result);
      return { success: true, runTriggerId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error deleting Terraform run trigger "${runTriggerId}"`);
    }
  },
});
