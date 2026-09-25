// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryCreateProjectWebhookSubscription = tool({
  description: "Registers a new webhook subscription for a Sentry project to send HTTP POST notifications to a specified URL for given events, provided the project has the 'servicehooks' feature enabled.",
  inputSchema: z.object({
    sentryToken: tokenField,
    url: z.string().describe("The fully qualified URL to which Sentry will send webhook POST requests for the subscribed events."),
    events: z.array(z.string()).describe("A list of event types to subscribe to for this webhook. Valid event types are: 'event.alert' (triggered when alerts fire) and 'event.created' (triggered when new events are processed). When any of these events occur in t"),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project for which to create the webhook."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, url, events, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/hooks/`, { body: { url: url, events: events } });
  },
});

export const sentryCreateSentryExternalIssueLink = tool({
  description: "Links an existing Sentry issue to an issue in an external service, or updates an existing link, requiring a configured Sentry App installation `uuid`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    uuid: z.string().describe("UUID of the Sentry App installation, used to associate the external issue with the correct Sentry instance."),
    webUrl: z.string().describe("URL of the external issue in the third-party service; should be a direct link."),
    issueId: z.number().int().describe("ID of the Sentry issue to link to the external issue."),
    project: z.string().describe("Identifier for the project in the external service (not the Sentry project ID), e.g., JIRA project key, GitHub repository name."),
    identifier: z.string().describe("Unique identifier for the external issue within the third-party service (e.g., JIRA issue key, GitHub issue number)."),
  }),
  execute: async ({ sentryToken, uuid, webUrl, issueId, project, identifier }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/sentry-app-installations/${uuid}/external-issues/`, { body: { webUrl: webUrl, issueId: issueId, project: project, identifier: identifier } });
  },
});

export const sentryDeleteACustomIntegration = tool({
  description: "Deletes a custom integration (Sentry App) by its ID or slug. Use when you need to permanently remove a custom integration from your organization. Requires org:admin scope.",
  inputSchema: z.object({
    sentryToken: tokenField,
    sentryAppIdOrSlug: z.string().describe("The ID or slug of the custom integration (Sentry App) to delete. Use the slug (e.g., 'my-integration') or UUID. Slugs are case-sensitive."),
  }),
  execute: async ({ sentryToken, sentryAppIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/sentry-apps/${sentryAppIdOrSlug}/`, { query: {  } });
  },
});

export const sentryDeleteExternalIssueByUuid = tool({
  description: "Unlinks an external issue (e.g., from Jira/GitHub), identified by `external_issue_id`, from the Sentry app installation specified by `uuid`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    uuid: z.string().describe("Unique identifier (UUID) of the Sentry app installation."),
    externalIssueId: z.string().describe("Platform-specific identifier of the external issue to be unlinked."),
  }),
  execute: async ({ sentryToken, uuid, externalIssueId }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/sentry-app-installations/${uuid}/external-issues/${externalIssueId}/`, { query: {  } });
  },
});

export const sentryDeleteOrganizationIntegration = tool({
  description: "Permanently removes an integration installation from a Sentry organization. This action requires the numeric integration ID, which can be obtained by first calling retrieve_organization_integrations_list. Required permissions: org:admin or org:integrations scope.",
  inputSchema: z.object({
    sentryToken: tokenField,
    integrationId: z.string().describe("The numeric ID of the integration installation on the organization. This is a string representation of a numeric value (e.g., '12345', '67890'). You can obtain integration IDs by first listing the organization's integrat"),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization from which the integration will be deleted."),
  }),
  execute: async ({ sentryToken, integrationId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/integrations/${integrationId}/`, { query: {  } });
  },
});

export const sentryDeleteProjectHook = tool({
  description: "Deletes a specific service hook from a Sentry project using its organization, project, and hook identifiers.",
  inputSchema: z.object({
    sentryToken: tokenField,
    hookId: z.string().describe("The unique identifier (GUID) of the service hook to be deleted from the specified project."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project from which the service hook will be removed."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the project and service hook belong."),
  }),
  execute: async ({ sentryToken, hookId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/hooks/${hookId}/`, { query: {  } });
  },
});

export const sentryGetIntegrationDetailsByOrg = tool({
  description: "Retrieves details for a specific integration, identified by `integration_id`, installed within an existing Sentry organization, identified by `organization_id_or_slug`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    integrationId: z.string().describe("The unique numeric ID of the integration installed for the specified organization. This is the integration's internal ID (e.g., '12345'), not the provider key. To find integration IDs, use the list organization integrati"),
    organizationIdOrSlug: z.string().describe("The Sentry organization's unique ID or human-readable slug (e.g., 'the-acme-corp')."),
  }),
  execute: async ({ sentryToken, integrationId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/integrations/${integrationId}/`, { query: {  } });
  },
});

export const sentryGetProjectHook = tool({
  description: "Retrieves detailed information for an existing service hook within a Sentry project. Service hooks (webhooks) are HTTP callbacks that notify external systems when specific events occur in Sentry, such as when alerts are triggered ('event.alert') or new events are processed ('event.created'). This ac",
  inputSchema: z.object({
    sentryToken: tokenField,
    hookId: z.string().describe("The unique identifier (GUID) of the service hook to be retrieved. This ID is assigned when the hook is created."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry project to which the service hook is bound."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization to which the project and its service hook belong."),
  }),
  execute: async ({ sentryToken, hookId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/hooks/${hookId}/`, { query: {  } });
  },
});

export const sentryGetSentryAppInstallationsForOrganization = tool({
  description: "Retrieves a list of Sentry App installations for a given organization, which must exist.",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/sentry-app-installations/`, { query: {  } });
  },
});

export const sentryListSeerAiModels = tool({
  description: "Retrieves the list of AI models currently used in production in Seer. Use when you need to discover which LLM models Seer is actively using.",
  inputSchema: z.object({
    sentryToken: tokenField,
  }),
  execute: async ({ sentryToken }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/seer/models/`, { query: {  } });
  },
});

export const sentryRetrieveACustomIntegrationByIdOrSlug = tool({
  description: "Retrieves detailed information about a custom integration (Sentry App) by its slug. Use this action when you need to: - Get configuration details of a custom integration including scopes, webhooks, and OAuth settings - Check the status and permissions of an integration - Retrieve integration metadat",
  inputSchema: z.object({
    sentryToken: tokenField,
    sentryAppIdOrSlug: z.string().describe("The URL-friendly slug of the custom integration (Sentry App) to retrieve. Note: Use the slug (e.g., 'my-integration'), not the UUID. Slugs are case-sensitive."),
  }),
  execute: async ({ sentryToken, sentryAppIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/sentry-apps/${sentryAppIdOrSlug}/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationIntegrationsList = tool({
  description: "Retrieves a list of available integrations for an existing Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    features: z.array(z.string()).optional().describe("Filters integrations by their supported features. Refer to Sentry's [Integrations Documentation](/product/integrations/) for an updated list of features. Examples include: `alert-rule`, `chat-unfurl`, `codeowners`, `comm"),
    providerKey: z.string().optional().describe("Filters integrations by a specific provider key. Refer to Sentry's [Integrations Documentation](/product/integrations/) for an updated list of providers."),
    includeConfig: z.boolean().optional().describe("If `True`, fetches detailed third-party configurations for each integration; this may significantly increase response time."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, features, providerKey, includeConfig, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/integrations/`, { query: { features: features, providerKey: providerKey, includeConfig: includeConfig } });
  },
});

export const sentryRetrieveOrgIntegrationConfig = tool({
  description: "Retrieves configuration for all integrations, or a specific integration if `providerKey` is given, for an existing Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    providerKey: z.string().optional().describe("Key of a specific integration provider (e.g., 'slack', 'github', 'jira') to filter by; if omitted, returns configurations for all integrations. Refer to Sentry's documentation for supported provider keys."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization for which to retrieve integration configurations."),
  }),
  execute: async ({ sentryToken, providerKey, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/integrations/config/`, { query: { providerKey: providerKey } });
  },
});

export const sentryRetrieveProjectHooks = tool({
  description: "Return a list of service hooks (webhooks) bound to a Sentry project, used to send notifications to external services upon event occurrences.",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Pagination cursor to retrieve the next or previous set of results (e.g., '100:0:1')."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, cursor, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/hooks/`, { query: { cursor: cursor } });
  },
});

export const sentryRetrieveSeerIssueFixState = tool({
  description: "Retrieves the current detailed state of an AI-assisted autofix process for a Sentry issue. Use when you need to check the progress, status, root cause analysis, proposed solutions, or code modifications for an autofix operation.",
  inputSchema: z.object({
    sentryToken: tokenField,
    issueId: z.string().describe("The ID of the issue to retrieve autofix state for."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the issue belongs to."),
  }),
  execute: async ({ sentryToken, issueId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/autofix/`, { query: {  } });
  },
});

export const sentryRetrieveTheCustomIntegsCreatedByAnOrg = tool({
  description: "Retrieves custom integrations (Sentry Apps) created by an organization. Use when you need to list all custom integrations that the organization has developed.",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/sentry-apps/`, { query: {  } });
  },
});

export const sentryStartSeerIssueFix = tool({
  description: "Trigger a Seer Issue Fix run for a specific issue. Use when you want to start an AI-assisted autofix process that operates asynchronously to identify root causes, propose solutions, generate code changes, and optionally create pull requests with fixes.",
  inputSchema: z.object({
    sentryToken: tokenField,
    eventId: z.string().optional().describe("Run issue fix on a specific event. If not provided, the recommended event for the issue will be used."),
    issueId: z.number().int().describe("The ID of the issue to trigger autofix for."),
    instruction: z.string().optional().describe("Optional custom instruction to guide the issue fix process. Provide specific guidance on how the fix should be approached."),
    stoppingPoint: z.string().optional().describe("Where the autofix process should stop: 'root_cause', 'solution', 'code_changes', or 'open_pr'. Defaults to root cause if not specified."),
    prToCommentOnUrl: z.string().optional().describe("URL of a pull request where the issue fix should add comments. Must be a valid GitHub pull request URL."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the issue belongs to."),
  }),
  execute: async ({ sentryToken, eventId, issueId, instruction, stoppingPoint, prToCommentOnUrl, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/issues/${issueId}/autofix/`, { body: { event_id: eventId, instruction: instruction, stopping_point: stoppingPoint, pr_to_comment_on_url: prToCommentOnUrl } });
  },
});

export const sentryUpdateAnExistingCustomIntegration = tool({
  description: "Updates an existing custom integration (Sentry App) with new configuration. Use this action to modify integration settings such as name, scopes, webhook URL, or other configuration. You must provide the integration's slug or ID and the required fields (name and scopes).",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("The name of the custom integration. This is the display name shown to users."),
    author: z.string().optional().describe("The custom integration's author name or organization."),
    events: z.array(z.string()).optional().describe("Webhook events the custom integration is subscribed to (e.g., 'issue', 'comment', 'event.alert')."),
    schema: z.record(z.any()).optional().describe("The UI components schema, used to render the custom integration's configuration UI elements. See Sentry's schema docs for more information."),
    scopes: z.array(z.string()).describe("The custom integration's permission scopes for API access (e.g., 'project:read', 'event:read', 'org:read'). This field is required for updating the integration."),
    overview: z.string().optional().describe("The custom integration's description or overview text."),
    isInternal: z.boolean().optional().describe("Whether or not the integration is internal only. False means the integration is public. Defaults to false if not specified."),
    webhookUrl: z.string().optional().describe("The webhook destination URL where Sentry will send event notifications."),
    isAlertable: z.boolean().optional().describe("Marks whether or not the custom integration can be used in an alert rule. Defaults to false if not specified."),
    redirectUrl: z.string().optional().describe("The post-installation redirect URL where users are sent after installing the integration."),
    verifyInstall: z.boolean().optional().describe("Whether or not an installation of the custom integration should be verified. Defaults to true if not specified."),
    allowedOrigins: z.array(z.string()).optional().describe("The list of allowed origins for CORS configuration."),
    sentryAppIdOrSlug: z.string().describe("The ID or slug of the custom integration to update. Use the slug (e.g., 'my-integration'), not the UUID. Slugs are case-sensitive."),
  }),
  execute: async ({ sentryToken, name, author, events, schema, scopes, overview, isInternal, webhookUrl, isAlertable, redirectUrl, verifyInstall, allowedOrigins, sentryAppIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/sentry-apps/${sentryAppIdOrSlug}/`, { body: { name: name, author: author, events: events, schema: schema, scopes: scopes, overview: overview, isInternal: isInternal, webhookUrl: webhookUrl, isAlertable: isAlertable, redirectUrl: redirectUrl, verifyInstall: verifyInstall, allowedOrigins: allowedOrigins } });
  },
});

export const sentryUpdateWebhookConfigurationXp = tool({
  description: "Updates an existing Sentry service hook's target URL and subscribed event types for a given project and organization. Service hooks (webhooks) are HTTP callbacks that notify external systems when specific events occur in Sentry. This action allows you to modify the webhook's URL and change which eve",
  inputSchema: z.object({
    sentryToken: tokenField,
    url: z.string().describe("The URL to which Sentry will send webhook POST requests when subscribed events occur."),
    events: z.array(z.string()).describe("A list of Sentry event types to subscribe to. Valid event types are: 'event.alert' (triggered when alerts fire) and 'event.created' (triggered when new events are processed)."),
    hookId: z.string().describe("The unique identifier (GUID) of the service hook to be updated."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project to which the service hook belongs."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to which the service hook belongs."),
  }),
  execute: async ({ sentryToken, url, events, hookId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/hooks/${hookId}/`, { body: { url: url, events: events } });
  },
});
