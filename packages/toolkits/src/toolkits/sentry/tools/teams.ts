// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryAddTeamMemberInOrganization = tool({
  description: "Adds an existing member of an organization to one of its teams; the member must already belong to the organization, and the team must also belong to that organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    memberId: z.string().describe("ID of the existing organization member to be added to the team."),
    teamIdOrSlug: z.string().describe("The ID or slug of the team to which the member will be added. Slugs are typically lowercase and use hyphens."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization. Slugs are typically lowercase and use hyphens."),
  }),
  execute: async ({ sentryToken, memberId, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/members/${memberId}/teams/${teamIdOrSlug}/`, { body: {  } });
  },
});

export const sentryCreateOrganizationTeam = tool({
  description: "Creates a new team in a Sentry organization, requiring either a 'slug' or 'name' to define the team.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().optional().describe("Optional. The display name for the new team. If not supplied, it's auto-generated from the `slug` (if `slug` is provided). At least one of `name` or `slug` is required to create a team."),
    slug: z.string().optional().describe("Optional. A unique, URL-friendly identifier for the new team. If not supplied, it's auto-generated from the `name` (if `name` is provided). Must adhere to the pattern: `^[a-z][a-z0-9_\\-]*$`."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization where the new team will be created. This organization must already exist."),
  }),
  execute: async ({ sentryToken, name, slug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/teams/`, { body: { name: name, slug: slug } });
  },
});

export const sentryDeleteExternalTeamById = tool({
  description: "Unlinks a previously established external team from a Sentry team; this action does not delete either the Sentry team or the external team.",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamIdOrSlug: z.string().describe("Unique identifier (ID or slug) of the Sentry team."),
    externalTeamId: z.number().int().describe("Numeric ID of the external team integration, typically obtained when the link was established."),
    organizationIdOrSlug: z.string().describe("Unique identifier (ID or slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, teamIdOrSlug, externalTeamId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/external-teams/${externalTeamId}/`, { query: {  } });
  },
});

export const sentryDeleteMemberFromTeam = tool({
  description: "Removes an organization member from a Sentry team, revoking their team-specific permissions, provided the member is currently part of that team.",
  inputSchema: z.object({
    sentryToken: tokenField,
    memberId: z.string().describe("Identifier (ID) of the organization member to remove from the team (e.g., '234567'). Typically a numerical ID."),
    teamIdOrSlug: z.string().describe("Identifier (ID) or slug of the Sentry team from which the member will be removed (e.g., 'frontend-developers', '98765'). Team slugs are typically lowercase and hyphenated."),
    organizationIdOrSlug: z.string().describe("Identifier (ID) or slug of the Sentry organization (e.g., 'our-company', '123456'). Slugs are typically lowercase and hyphenated."),
  }),
  execute: async ({ sentryToken, memberId, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/members/${memberId}/teams/${teamIdOrSlug}/`, { query: {  } });
  },
});

export const sentryDeleteTeamByOrganizationOrTeamSlug = tool({
  description: "Schedules a Sentry team for asynchronous deletion, which releases the team's slug for reuse upon successful scheduling.",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry team targeted for deletion. For example, 'frontend-devs' or '67890'."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization to which the team belongs. For example, 'acme-corp' or '12345'."),
  }),
  execute: async ({ sentryToken, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/`, { query: {  } });
  },
});

export const sentryGetTeamMembersByIdOrSlug = tool({
  description: "Retrieves all active members of a Sentry team with detailed user information, roles, and permissions. This endpoint returns members who have accepted their team invitation. Users with pending invitations are excluded from the results. Each member object includes comprehensive details such as user pr",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Optional pagination cursor for fetching the next page of results. Obtain this value from the 'Link' header in the previous API response. Leave empty for the first request."),
    teamIdOrSlug: z.string().describe("The ID or slug of the team. Can be either a numeric ID (e.g., '4510810786627585') or a URL-friendly slug (e.g., 'backend-team')."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization. Can be either a numeric ID (e.g., '4508539392294912') or a URL-friendly slug (e.g., 'my-organization')."),
  }),
  execute: async ({ sentryToken, cursor, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/members/`, { query: { cursor: cursor } });
  },
});

export const sentryListTeamsInOrganization = tool({
  description: "Lists teams for an existing Sentry organization, optionally including project details and supporting pagination via a cursor.",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Pagination cursor for retrieving the next or previous page of results."),
    detailed: z.string().optional().describe("If '1', includes project details for each team. If '0' or not provided, excludes project details."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, cursor, detailed, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/teams/`, { query: { cursor: cursor, detailed: detailed } });
  },
});

export const sentryManageTeamExternalIntegrations = tool({
  description: "Links an external team or channel (e.g., Slack, GitHub) to an existing Sentry team, using a pre-configured integration for the specified provider and its valid Sentry integration ID.",
  inputSchema: z.object({
    sentryToken: tokenField,
    provider: z.enum(["github", "github_enterprise", "slack", "gitlab", "msteams", "jira_server", "perforce", "custom_scm"]).describe("The third-party integration provider. Supported values: github, github_enterprise, jira_server, slack, perforce, gitlab, msteams, custom_scm."),
    externalId: z.string().optional().describe("Optional: The associated user ID for the provider (e.g., Slack user ID like U123ABC456)."),
    externalName: z.string().describe("The associated name for the provider (e.g., Slack channel name like #engineering, GitHub team like @dev-team)."),
    integrationId: z.number().int().describe("The Integration ID from Sentry. Use the 'retrieve_organization_integrations_list' action to find valid integration IDs for your organization."),
    teamIdOrSlug: z.string().describe("The ID or slug of the team the resource belongs to."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, provider, externalId, externalName, integrationId, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/external-teams/`, { body: { provider: provider, external_id: externalId, external_name: externalName, integration_id: integrationId } });
  },
});

export const sentryRetrieveTeamInfoViaOrganizationIdOrSlug = tool({
  description: "Retrieves detailed information for an existing Sentry team within its organization, optionally expanding related data (e.g., projects) or collapsing sections (e.g., organization details).",
  inputSchema: z.object({
    sentryToken: tokenField,
    expand: z.string().optional().describe("A comma-separated string listing extra data sections to include in the response. Supported values are `projects` (to include details of projects associated with the team) and `externalTeams` (to include mappings to exter"),
    collapse: z.string().optional().describe("A comma-separated string listing data sections to exclude from the response. Supported value is `organization` (to exclude detailed organization information from the team details)."),
    teamIdOrSlug: z.string().describe("The numeric ID or human-readable slug of the Sentry team whose details are to be retrieved. Use team slugs (e.g., 'my-team', 'engineering') or numeric IDs (e.g., '4506274564079616'). Note: UUID format identifiers are NOT"),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the team belongs."),
  }),
  execute: async ({ sentryToken, expand, collapse, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/`, { query: { expand: expand, collapse: collapse } });
  },
});

export const sentryRetrieveTeamProjects = tool({
  description: "Retrieves a list of Sentry projects for a specific team within an organization, supporting pagination via a cursor.",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Pagination cursor for navigating through project lists; if omitted, the first page is returned."),
    teamIdOrSlug: z.string().describe("The ID or slug of the Sentry team."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, cursor, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/projects/`, { query: { cursor: cursor } });
  },
});

export const sentrySwitchTeamRoleForMember = tool({
  description: "Changes a member's role within a Sentry team, ensuring the member is already part of the team and that any organization-level role restrictions are respected.",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamRole: z.enum(["contributor", "admin"]).optional().describe("Details for available team roles: `contributor` allows viewing/acting on events and most team project data; `admin` grants team administration privileges like managing projects and memberships."),
    memberId: z.string().describe("Identifier for the organization member."),
    teamIdOrSlug: z.string().describe("Identifier (ID or slug) for the Sentry team."),
    organizationIdOrSlug: z.string().describe("Identifier (ID or slug) for the Sentry organization."),
  }),
  execute: async ({ sentryToken, teamRole, memberId, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/members/${memberId}/teams/${teamIdOrSlug}/`, { body: { teamRole: teamRole } });
  },
});

export const sentryUpdateExternalTeamIntegration = tool({
  description: "Updates an existing external team integration's display name, provider, Sentry integration ID, or external ID; the `integration_id` must match a valid, configured Sentry integration for the organization and the specified `provider`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    provider: z.enum(["github", "github_enterprise", "slack", "gitlab", "msteams", "custom_scm", "jira_server", "perforce"]).describe("Provider of the external actor; must match the provider of the integration."),
    externalId: z.string().optional().describe("Optional: External ID for the team within the provider's system, distinct from its name."),
    externalName: z.string().describe("New display name for the team in the external provider."),
    integrationId: z.number().int().describe("Unique ID of the Sentry integration instance connecting Sentry to the external provider."),
    teamIdOrSlug: z.string().describe("ID or slug of the Sentry team."),
    externalTeamId: z.number().int().describe("Unique ID of the external team object to update."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, provider, externalId, externalName, integrationId, teamIdOrSlug, externalTeamId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/external-teams/${externalTeamId}/`, { body: { provider: provider, external_id: externalId, external_name: externalName, integration_id: integrationId } });
  },
});

export const sentryUpdateTeamInformationByOrganizationId = tool({
  description: "Updates the slug for an existing team within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    slug: z.string().describe("The new slug for the team. Must be unique within the organization and follow the pattern: starts with a lowercase letter, followed by lowercase letters, numbers, underscores, or hyphens."),
    teamIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the team whose slug is to be updated."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the organization to which the team belongs."),
  }),
  execute: async ({ sentryToken, slug, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/`, { body: { slug: slug } });
  },
});
