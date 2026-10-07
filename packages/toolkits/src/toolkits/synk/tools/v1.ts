// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { synkV1, failedResult, toSynkError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Synk credentials JSON with apiKey (Snyk API token) and optional baseUrl for the region (default https://api.snyk.io)',
  );
const orgSlugField = z.string().describe('Organization slug or ID for V1 API paths');

export const synkV1ListOrgs = tool({
  description: 'List all organizations the user belongs to (V1). Use to discover org slugs.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
  }),
  execute: async ({ synkCredentials }) => {
    try {
      const result = await synkV1(synkCredentials, '/orgs');
      if (!result.ok) return failedResult('Failed to list organizations (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing organizations (v1)');
    }
  },
});

export const synkV1CreateOrg = tool({
  description: 'Create a new organization (V1) with a name and optional group/tag.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    name: z.string().describe('Organization name'),
    groupId: z.string().optional().describe('Group ID to create the org in'),
  }),
  execute: async ({ synkCredentials, name, groupId }) => {
    try {
      const result = await synkV1(synkCredentials, '/org', {
        method: 'POST',
        body: { name, ...(groupId !== undefined ? { groupId } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create organization (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating organization (v1)');
    }
  },
});

export const synkV1DeleteOrg = tool({
  description: 'Remove an organization (V1). Cannot be undone.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
  }),
  execute: async ({ synkCredentials, orgId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete organization (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting organization (v1)');
    }
  },
});

export const synkV1GetOrgSettings = tool({
  description: 'View organization settings (V1), e.g. request-access flag.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
  }),
  execute: async ({ synkCredentials, orgId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/settings`);
      if (!result.ok) return failedResult('Failed to get org settings (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting org settings (v1)');
    }
  },
});

export const synkV1UpdateOrgSettings = tool({
  description: 'Update organization settings (V1); only requestAccess is editable.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    requestAccess: z.boolean().describe('Allow users to request access to the org'),
  }),
  execute: async ({ synkCredentials, orgId, requestAccess }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/settings`, {
        method: 'PUT',
        body: { requestAccess },
      });
      if (!result.ok) return failedResult('Failed to update org settings (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating org settings (v1)');
    }
  },
});

export const synkV1ListMembers = tool({
  description: 'List members of an organization (V1) with roles.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
  }),
  execute: async ({ synkCredentials, orgId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/members`);
      if (!result.ok) return failedResult('Failed to list members (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing members (v1)');
    }
  },
});

export const synkV1UpdateMember = tool({
  description: 'Update a member role in an organization (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    userId: z.string().describe('User ID'),
    role: z.string().describe('New role, e.g. admin, collaborator'),
  }),
  execute: async ({ synkCredentials, orgId, userId, role }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/members/${userId}`, {
        method: 'PUT',
        body: { role },
      });
      if (!result.ok) return failedResult('Failed to update member (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating member (v1)');
    }
  },
});

export const synkV1RemoveMember = tool({
  description: 'Remove a member from an organization (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    userId: z.string().describe('User ID'),
  }),
  execute: async ({ synkCredentials, orgId, userId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to remove member (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error removing member (v1)');
    }
  },
});

export const synkV1InviteUser = tool({
  description: 'Invite a user to an organization by email (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    email: z.string().describe('Invitee email'),
    isAdmin: z.boolean().optional().describe('Invite as admin'),
  }),
  execute: async ({ synkCredentials, orgId, email, isAdmin }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/invite`, {
        method: 'POST',
        body: { email, ...(isAdmin !== undefined ? { isAdmin } : {}) },
      });
      if (!result.ok) return failedResult('Failed to invite user (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error inviting user (v1)');
    }
  },
});

export const synkV1ListIntegrations = tool({
  description:
    'List source-control and registry integrations of an org (V1). Use to find integration IDs for imports.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
  }),
  execute: async ({ synkCredentials, orgId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/integrations`);
      if (!result.ok) return failedResult('Failed to list integrations (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing integrations (v1)');
    }
  },
});

export const synkV1AddIntegration = tool({
  description: 'Add a new integration to an org (V1) by type with credentials.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    type: z.string().describe('Integration type, e.g. github, docker-hub, ecr'),
    credentials: z.record(z.string(), z.any()).optional().describe('Integration credentials'),
  }),
  execute: async ({ synkCredentials, orgId, type, credentials }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/integrations`, {
        method: 'POST',
        body: { type, ...(credentials !== undefined ? credentials : {}) },
      });
      if (!result.ok) return failedResult('Failed to add integration (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error adding integration (v1)');
    }
  },
});

export const synkV1UpdateIntegration = tool({
  description: 'Update integration credentials or settings (V1). Use for broker token rotation.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    integrationId: z.string().describe('Integration ID'),
    integration: z.record(z.string(), z.any()).describe('Integration fields to update'),
  }),
  execute: async ({ synkCredentials, orgId, integrationId, integration }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/integrations/${integrationId}`, {
        method: 'PUT',
        body: integration,
      });
      if (!result.ok) return failedResult('Failed to update integration (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating integration (v1)');
    }
  },
});

export const synkV1GetIntegrationSettings = tool({
  description: 'Retrieve integration settings (V1), e.g. test frequency and PR checks.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    integrationId: z.string().describe('Integration ID'),
  }),
  execute: async ({ synkCredentials, orgId, integrationId }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/integrations/${integrationId}/settings`,
      );
      if (!result.ok) return failedResult('Failed to get integration settings (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting integration settings (v1)');
    }
  },
});

export const synkV1UpdateIntegrationSettings = tool({
  description: 'Update integration settings (V1): auto-test, PR checks, depot scanning.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    integrationId: z.string().describe('Integration ID'),
    settings: z.record(z.string(), z.any()).describe('Settings to update'),
  }),
  execute: async ({ synkCredentials, orgId, integrationId, settings }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/integrations/${integrationId}/settings`,
        { method: 'PUT', body: settings },
      );
      if (!result.ok) return failedResult('Failed to update integration settings (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating integration settings (v1)');
    }
  },
});

export const synkV1ImportTargets = tool({
  description:
    'Kick off import of repos/targets via an integration (V1). Returns a job URL to poll. Owner is case-sensitive.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    integrationId: z.string().describe('Integration ID'),
    targets: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Targets [{owner, name, branch?}] to import'),
  }),
  execute: async ({ synkCredentials, orgId, integrationId, targets }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/integrations/${integrationId}/import`,
        {
          method: 'POST',
          body: { target: targets },
        },
      );
      if (!result.ok) return failedResult('Failed to import targets (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error importing targets (v1)');
    }
  },
});

export const synkV1GetImportJob = tool({
  description: 'Poll import job details: per-manifest success flags and project URLs.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    integrationId: z.string().describe('Integration ID'),
    jobId: z.string().describe('Import job ID'),
  }),
  execute: async ({ synkCredentials, orgId, integrationId, jobId }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/integrations/${integrationId}/import/${jobId}`,
      );
      if (!result.ok) return failedResult('Failed to get import job (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting import job (v1)');
    }
  },
});

export const synkV1ListIgnores = tool({
  description: 'List all ignores on a project (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/project/${projectId}/ignores`);
      if (!result.ok) return failedResult('Failed to list ignores (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing ignores (v1)');
    }
  },
});

export const synkV1AddIgnore = tool({
  description:
    'Ignore an issue on chosen expiry/paths with a reason (V1). Use to silence accepted risk.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
    issueId: z.string().describe('Issue ID'),
    ignore: z
      .record(z.string(), z.any())
      .describe('Ignore: reason, reasonType, expires, ignorePath, source'),
  }),
  execute: async ({ synkCredentials, orgId, projectId, issueId, ignore }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/ignore/${issueId}`,
        {
          method: 'POST',
          body: ignore,
        },
      );
      if (!result.ok) return failedResult('Failed to add ignore (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error adding ignore (v1)');
    }
  },
});

export const synkV1GetIgnore = tool({
  description: 'Retrieve the ignore record of one issue (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
    issueId: z.string().describe('Issue ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId, issueId }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/ignore/${issueId}`,
      );
      if (!result.ok) return failedResult('Failed to get ignore (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting ignore (v1)');
    }
  },
});

export const synkV1DeleteIgnore = tool({
  description: 'Delete (un-ignore) an issue ignore so it reports again (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
    issueId: z.string().describe('Issue ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId, issueId }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/ignore/${issueId}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete ignore (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting ignore (v1)');
    }
  },
});

export const synkV1GetProject = tool({
  description: 'Retrieve a single project (V1) with issue counts.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/project/${projectId}`);
      if (!result.ok) return failedResult('Failed to get project (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting project (v1)');
    }
  },
});

export const synkV1UpdateProject = tool({
  description: 'Update a project name/branch (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
    project: z.record(z.string(), z.any()).describe('Project fields to update'),
  }),
  execute: async ({ synkCredentials, orgId, projectId, project }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/project/${projectId}`, {
        method: 'PUT',
        body: project,
      });
      if (!result.ok) return failedResult('Failed to update project (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating project (v1)');
    }
  },
});

export const synkV1DeleteProject = tool({
  description: 'Delete a project (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/project/${projectId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete project (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting project (v1)');
    }
  },
});

export const synkV1AddProjectTag = tool({
  description: 'Add a tag to a project (V1), e.g. {key, value} for grouping.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
    key: z.string().describe('Tag key'),
    value: z.string().describe('Tag value'),
  }),
  execute: async ({ synkCredentials, orgId, projectId, key, value }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/project/${projectId}/tags`, {
        method: 'POST',
        body: { key, value },
      });
      if (!result.ok) return failedResult('Failed to add project tag (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error adding project tag (v1)');
    }
  },
});

export const synkV1RemoveProjectTag = tool({
  description: 'Remove a tag from a project (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
    key: z.string().describe('Tag key'),
    value: z.string().describe('Tag value'),
  }),
  execute: async ({ synkCredentials, orgId, projectId, key, value }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/tags/remove`,
        {
          method: 'POST',
          body: { key, value },
        },
      );
      if (!result.ok) return failedResult('Failed to remove project tag (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error removing project tag (v1)');
    }
  },
});

export const synkV1ListAggregatedIssues = tool({
  description:
    'List aggregated project issues with per-path ignore reasons (V1). Legacy reporting regions only; elsewhere use REST Issues.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/aggregated-issues`,
      );
      if (!result.ok) return failedResult('Failed to list aggregated issues (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing aggregated issues (v1)');
    }
  },
});

export const synkV1TestPackage = tool({
  description:
    'Test one package version for known vulnerabilities without importing (V1). Supports npm, maven, pypi, and more.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    ecosystem: z
      .string()
      .describe('Ecosystem, e.g. npm, maven, pypi, golang, nuget, composer, rubygems'),
    name: z.string().describe('Package name (maven: group:artifact)'),
    version: z.string().describe('Package version'),
    orgId: z.string().optional().describe('Org slug to scope unmanaged/entitled data'),
  }),
  execute: async ({ synkCredentials, ecosystem, name, version, orgId }) => {
    try {
      const result = await synkV1(synkCredentials, `/test/${ecosystem}`, {
        method: 'POST',
        query: orgId !== undefined ? { org: orgId } : undefined,
        body: { name, version },
      });
      if (!result.ok) return failedResult('Failed to test package (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error testing package (v1)');
    }
  },
});

export const synkV1ListJiraIssues = tool({
  description: 'List Jira issues created from a project (V1). Requires Jira integration.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/jira-issues`,
      );
      if (!result.ok) return failedResult('Failed to list Jira issues (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing Jira issues (v1)');
    }
  },
});

export const synkV1CreateJiraIssue = tool({
  description: 'Create a Jira issue from a Snyk issue (V1). Requires Jira integration.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
    issueId: z.string().describe('Snyk issue ID'),
    fields: z
      .record(z.string(), z.any())
      .optional()
      .describe('Jira fields (project key, issue type, ...)'),
  }),
  execute: async ({ synkCredentials, orgId, projectId, issueId, fields }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/issue/${issueId}/jira-issue`,
        { method: 'POST', body: fields ?? {} },
      );
      if (!result.ok) return failedResult('Failed to create Jira issue (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating Jira issue (v1)');
    }
  },
});

export const synkV1ListWebhooks = tool({
  description: 'List webhooks of an organization (V1, beta).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
  }),
  execute: async ({ synkCredentials, orgId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/webhooks`);
      if (!result.ok) return failedResult('Failed to list webhooks (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing webhooks (v1)');
    }
  },
});

export const synkV1CreateWebhook = tool({
  description:
    'Create a webhook (URL + secret) for org events like test and issue updates (V1, beta).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    url: z.string().describe('HTTPS endpoint receiving events'),
    secret: z.string().optional().describe('Signing secret for payloads'),
  }),
  execute: async ({ synkCredentials, orgId, url, secret }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/webhooks`, {
        method: 'POST',
        body: { url, ...(secret !== undefined ? { secret } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create webhook (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating webhook (v1)');
    }
  },
});

export const synkV1GetWebhook = tool({
  description: 'Retrieve one webhook (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    webhookId: z.string().describe('Webhook ID'),
  }),
  execute: async ({ synkCredentials, orgId, webhookId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/webhooks/${webhookId}`);
      if (!result.ok) return failedResult('Failed to get webhook (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting webhook (v1)');
    }
  },
});

export const synkV1DeleteWebhook = tool({
  description: 'Delete a webhook (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    webhookId: z.string().describe('Webhook ID'),
  }),
  execute: async ({ synkCredentials, orgId, webhookId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/webhooks/${webhookId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete webhook (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting webhook (v1)');
    }
  },
});

export const synkV1PingWebhook = tool({
  description: 'Send a test ping event to a webhook endpoint (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    webhookId: z.string().describe('Webhook ID'),
  }),
  execute: async ({ synkCredentials, orgId, webhookId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/webhooks/${webhookId}/ping`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to ping webhook (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error pinging webhook (v1)');
    }
  },
});

export const synkV1ListEntitlements = tool({
  description: 'List feature entitlements of an organization (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
  }),
  execute: async ({ synkCredentials, orgId }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/entitlements`);
      if (!result.ok) return failedResult('Failed to list entitlements (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing entitlements (v1)');
    }
  },
});

export const synkV1GetEntitlement = tool({
  description: 'Get one entitlement value of an organization (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    entitlementKey: z.string().describe('Entitlement key'),
  }),
  execute: async ({ synkCredentials, orgId, entitlementKey }) => {
    try {
      const result = await synkV1(synkCredentials, `/org/${orgId}/entitlement/${entitlementKey}`);
      if (!result.ok) return failedResult('Failed to get entitlement (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting entitlement (v1)');
    }
  },
});

export const synkV1ListDependencies = tool({
  description: 'List all dependencies detected in a project (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgSlugField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ synkCredentials, orgId, projectId }) => {
    try {
      const result = await synkV1(
        synkCredentials,
        `/org/${orgId}/project/${projectId}/dependencies`,
      );
      if (!result.ok) return failedResult('Failed to list dependencies (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing dependencies (v1)');
    }
  },
});

export const synkV1ListGroupTags = tool({
  description: 'List all project tags used in a group (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
  }),
  execute: async ({ synkCredentials, groupId }) => {
    try {
      const result = await synkV1(synkCredentials, `/group/${groupId}/tags`);
      if (!result.ok) return failedResult('Failed to list group tags (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing group tags (v1)');
    }
  },
});

export const synkV1DeleteGroupTag = tool({
  description: 'Delete a project tag from a group (V1).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    key: z.string().describe('Tag key'),
    value: z.string().describe('Tag value'),
  }),
  execute: async ({ synkCredentials, groupId, key, value }) => {
    try {
      const result = await synkV1(synkCredentials, `/group/${groupId}/tags/delete`, {
        method: 'POST',
        body: { key, value },
      });
      if (!result.ok) return failedResult('Failed to delete group tag (v1)', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting group tag (v1)');
    }
  },
});
