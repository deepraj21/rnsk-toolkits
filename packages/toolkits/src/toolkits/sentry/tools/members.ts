// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryAddOrganizationMemberViaEmail = tool({
  description: "Invites a new member (or re-invites an existing non-accepted member) to a Sentry organization via email, allowing specification of organization and team roles.",
  inputSchema: z.object({
    sentryToken: tokenField,
    email: z.string().email().describe("The email address of the user to invite or add to the organization."),
    orgRole: z.enum(["billing", "member", "manager", "owner", "admin"]).optional().describe("Primary organization-level role. `billing`: Manages payment/compliance. `member`: Views events/data. `manager`: Manages teams, projects, membership. `owner`: Unrestricted access. `admin`: Edits global integrations, manag"),
    reinvite: z.boolean().optional().describe("If `True`, resends an invitation to a user previously invited but who has not yet accepted."),
    teamRoles: z.array(z.any()).optional().describe("List of team-specific role assignments. Common roles: `contributor` (views/acts on issues, may add members per org settings) and `admin` (full team/project management)."),
    sendInvite: z.boolean().optional().describe("If `True`, an invitation email is sent to the user. Set to `False` to add the member without an email notification."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization to which the member will be added."),
  }),
  execute: async ({ sentryToken, email, orgRole, reinvite, teamRoles, sendInvite, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/members/`, { body: { email: email, role: orgRole, reinvite: reinvite, teams: teamRoles, sendInvite: sendInvite } });
  },
});

export const sentryAddRemoveUserEmailById = tool({
  description: "Adds or removes a secondary email for an existing Sentry user, determined by whether the email already exists for that user.",
  inputSchema: z.object({
    sentryToken: tokenField,
    email: z.string().email().describe("The email address to be added to or removed from the user's Sentry account. Ensure this is a valid email format."),
    userId: z.string().describe("The unique identifier of the Sentry user (e.g., numeric ID or 'self') for whom the email address is being managed."),
  }),
  execute: async ({ sentryToken, email, userId }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/users/${userId}/emails/`, { body: { email: email } });
  },
});

export const sentryCreateExternalUserForOrganization = tool({
  description: "Links a Sentry user to an external identity provider's user within a Sentry organization; the Sentry user must be an organization member, an active integration for the provider must be configured, and `external_id` is typically required for the external user.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.number().int().describe("The unique numeric identifier for the external actor linkage being created. Its specific use may depend on the integration or Sentry's internal handling."),
    userId: z.number().int().describe("The numeric ID of the Sentry user to be linked with the external identity."),
    provider: z.enum(["github", "github_enterprise", "slack", "gitlab", "msteams", "custom_scm"]).describe("The external identity provider. Allowed values: `github`, `github_enterprise`, `slack`, `gitlab`, `msteams`, `custom_scm`."),
    externalId: z.string().optional().describe("The user's unique identifier on the external provider's platform (e.g., GitHub user ID, Slack member ID). This ID is specific to the selected `provider`."),
    externalName: z.string().describe("The display name of the user as known on the external provider's platform (e.g., GitHub username, Slack display name)."),
    integrationId: z.number().int().describe("The numeric ID of the Sentry integration that corresponds to the specified provider and is configured for the organization."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization where the external user linkage will be created."),
  }),
  execute: async ({ sentryToken, id, userId, provider, externalId, externalName, integrationId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/external-users/`, { body: { id: id, user_id: userId, provider: provider, external_id: externalId, external_name: externalName, integration_id: integrationId } });
  },
});

export const sentryCreateScimGroupForOrganization = tool({
  description: "Creates a new Sentry team (SCIM group) within an organization via the SCIM API. Requirements: - Organization must have SCIM enabled (requires Business Plan with SAML2) - Must use a SCIM bearer token (generated when SCIM is enabled) - Token must have 'team:admin' or 'team:write' scope Behavior: - A U",
  inputSchema: z.object({
    sentryToken: tokenField,
    displayName: z.string().describe("Human-readable name for the new team. A URL-friendly slug will be auto-generated by converting to lowercase and replacing spaces with dashes (e.g., 'My Team' → 'my-team'). Must be unique within the organization."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization where the new team will be created. Must be an organization with SCIM enabled."),
  }),
  execute: async ({ sentryToken, displayName, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/scim/v2/Groups/`, { body: { displayName: displayName } });
  },
});

export const sentryCreateUserForSamlIntegration = tool({
  description: "Creates a new Sentry organization member via a SCIM request for SAML integration; this action does not support setting secondary emails.",
  inputSchema: z.object({
    sentryToken: tokenField,
    userName: z.string().email().describe("User's email address, used as the SAML identifier for the new member."),
    sentryOrgRole: z.enum(["billing", "member", "manager", "admin"]).optional().describe("Organization role for the new member; defaults to the organization's default role. The `admin` role cannot be assigned in Business/Enterprise plans; use `TeamRoles` instead."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, userName, sentryOrgRole, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/scim/v2/Users/`, { body: { userName: userName, sentryOrgRole: sentryOrgRole } });
  },
});

export const sentryDeleteExternalUserFromOrganization = tool({
  description: "Deletes the link between an external user (from an integration provider like GitHub, Slack, GitLab, or MS Teams) and a Sentry user within the specified organization. This removes the association but does not delete the Sentry user itself. Requires org:admin or org:write permissions.",
  inputSchema: z.object({
    sentryToken: tokenField,
    externalUserId: z.number().int().describe("The unique numerical identifier of the external user linkage to delete. This ID is returned when creating an external user via the 'create_external_user_for_organization' action."),
    organizationIdOrSlug: z.string().describe("The ID or human-readable slug of the Sentry organization from which to delete the external user link."),
  }),
  execute: async ({ sentryToken, externalUserId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/external-users/${externalUserId}/`, { query: {  } });
  },
});

export const sentryDeleteOrganizationMember = tool({
  description: "Permanently removes a member from a Sentry organization, revoking their access to that organization and all its associated projects.",
  inputSchema: z.object({
    sentryToken: tokenField,
    memberId: z.string().describe("The unique identifier (ID) of the member to be removed from the organization."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or the human-readable slug of the Sentry organization from which the member will be removed."),
  }),
  execute: async ({ sentryToken, memberId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/members/${memberId}/`, { query: {  } });
  },
});

export const sentryDeleteTeamFromOrgScimV2 = tool({
  description: "Permanently and irreversibly deletes a specific team from a Sentry organization via a SCIM v2 request, provided SCIM integration is enabled for the organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamId: z.string().describe("The ID or slug of the team to be deleted. Can be either a numeric ID (as string) or a team slug."),
    organizationIdOrSlug: z.string().describe("The ID or URL-friendly slug of the Sentry organization from which the team will be deleted."),
  }),
  execute: async ({ sentryToken, teamId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/scim/v2/Groups/${teamId}/`, { query: {  } });
  },
});

export const sentryDeleteUserEmailsById = tool({
  description: "Permanently removes a Sentry user's email address; if multiple emails exist, Sentry's API logic (e.g., primary or previously marked) determines which is deleted.",
  inputSchema: z.object({
    sentryToken: tokenField,
    email: z.string().email().describe("The email address to remove from the user's Sentry account. Must be a secondary email (not the primary email)."),
    userId: z.string().describe("Unique identifier of the Sentry user. Use 'me' for the currently authenticated user."),
  }),
  execute: async ({ sentryToken, email, userId }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/users/${userId}/emails/`, { query: { email: email } });
  },
});

export const sentryDeleteUserFromOrg = tool({
  description: "Removes a SCIM-managed member from a Sentry organization that has SCIM enabled, permanently revoking their access.",
  inputSchema: z.object({
    sentryToken: tokenField,
    memberId: z.string().describe("The unique identifier of the organization member to remove."),
    organizationIdOrSlug: z.string().describe("The identifier or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, memberId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/scim/v2/Users/${memberId}/`, { query: {  } });
  },
});

export const sentryGetScimGroupByTeamId = tool({
  description: "Retrieves SCIM group information for a specific Sentry team. Returns the team's SCIM representation including ID, display name, and member list (limited to 10,000 members). Requires SCIM to be enabled for the organization (Business Plan with SAML2). Use this to query team details via the SCIM protoc",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamId: z.string().describe("The ID or slug of the Sentry team to query. Can be either a numeric team ID (e.g., '4508539392294912') or a team slug (e.g., 'backend-team')."),
    organizationIdOrSlug: z.string().describe("The slug or numeric ID of the Sentry organization that owns the team. SCIM must be enabled for this organization (requires Business Plan with SAML2)."),
  }),
  execute: async ({ sentryToken, teamId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/scim/v2/Groups/${teamId}/`, { query: {  } });
  },
});

export const sentryListOrganizationMembers = tool({
  description: "Lists all members, including those with pending invitations, for a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/members/`, { query: {  } });
  },
});

export const sentryListOrganizationUserTeams = tool({
  description: "Retrieves a list of all teams that the authenticated user has access to within the specified Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The unique identifier (numeric ID like '4508539392294912') or URL-friendly slug (like 'my-organization') of the Sentry organization."),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/user-teams/`, { query: {  } });
  },
});

export const sentryListScimV2OrganizationUsers = tool({
  description: "Retrieves a paginated list of SCIM (System for Cross-domain Identity Management) users for a Sentry organization, allowing for filtering, pagination, and attribute exclusion.",
  inputSchema: z.object({
    sentryToken: tokenField,
    count: z.number().int().optional().describe("Maximum number of user records per response (max 100)."),
    filter: z.string().optional().describe("SCIM filter expression to narrow down users (e.g., `userName eq 'user@example.com'`). Only `eq` operator is supported."),
    startIndex: z.number().int().optional().describe("The 1-based starting index for pagination."),
    excludedAttributes: z.array(z.string()).optional().describe("Attribute names to exclude from user objects; only `members` is currently supported for exclusion."),
    organizationIdOrSlug: z.string().describe("The organization's unique identifier (ID) or human-readable slug."),
  }),
  execute: async ({ sentryToken, count, filter, startIndex, excludedAttributes, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/scim/v2/Users/`, { query: { count: count, filter: filter, startIndex: startIndex, excludedAttributes: excludedAttributes } });
  },
});

export const sentryPatchScimGroupOperations = tool({
  description: "Performs SCIM PATCH operations (RFC 7644) to update attributes of a SCIM-enabled Sentry team, provided SCIM integration is active for the organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamId: z.number().int().describe("The unique identifier of the Sentry team to be updated."),
    operations: z.array(z.any()).describe("A list of SCIM patch operations to be applied to the team. Each operation specifies an action (e.g., add, remove, replace), a target path, and a value. Multiple operations can be provided to perform several updates in a "),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization to which the team belongs."),
  }),
  execute: async ({ sentryToken, teamId, operations, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PATCH", `/organizations/${organizationIdOrSlug}/scim/v2/Groups/${teamId}/`, { body: { Operations: operations } });
  },
});

export const sentryPatchUserActiveStatusInOrganization = tool({
  description: "Deactivates and permanently deletes a Sentry organization member by using a SCIM PATCH operation to set their 'active' attribute to 'false'.",
  inputSchema: z.object({
    sentryToken: tokenField,
    memberId: z.string().describe("The ID of the organization member to update."),
    operations: z.array(z.any()).describe("A list of SCIM PATCH operations. For this action, must contain one operation setting the member's 'active' attribute to 'false', which deactivates and permanently deletes the member."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, memberId, operations, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PATCH", `/organizations/${organizationIdOrSlug}/members/${memberId}/`, { body: { Operations: operations } });
  },
});

export const sentryRetrieveOrganizationMember = tool({
  description: "Retrieves details for a Sentry organization member or pending invitee, including role, teams, and status, using their member ID and the organization's ID or slug.",
  inputSchema: z.object({
    sentryToken: tokenField,
    memberId: z.string().describe("The unique identifier (ID) of the organization member whose details are to be retrieved."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, memberId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/members/${memberId}/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationScimGroups = tool({
  description: "Retrieves a paginated list of SCIM groups (teams) for a Sentry organization; the `members` field in the response for each group will contain at most 10,000 members.",
  inputSchema: z.object({
    sentryToken: tokenField,
    count: z.number().int().optional().describe("The maximum number of SCIM groups to return per page. The API enforces a maximum limit of 100."),
    filter: z.string().optional().describe("A SCIM filter expression to narrow down the list of groups. Currently, only the `eq` (equals) operator is supported, e.g., `displayName eq 'Engineering Team'`."),
    startIndex: z.number().int().optional().describe("The 1-based index for pagination, indicating the starting point of the results to retrieve. Follows SCIM standards."),
    excludedAttributes: z.array(z.string()).optional().describe("A list of attribute names to exclude from the response for each group. Currently, the only supported value for an attribute to exclude is `members`."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization for which to retrieve SCIM groups."),
  }),
  execute: async ({ sentryToken, count, filter, startIndex, excludedAttributes, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/scim/v2/Groups/`, { query: { count: count, filter: filter, startIndex: startIndex, excludedAttributes: excludedAttributes } });
  },
});

export const sentryRetrieveUserEmailInformation = tool({
  description: "Retrieves a list of email addresses for an existing Sentry user, identified by their `user_id`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    userId: z.string().describe("The unique identifier of the Sentry user for whom to retrieve email information."),
  }),
  execute: async ({ sentryToken, userId }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/users/${userId}/emails/`, { query: {  } });
  },
});

export const sentryRetrieveUserViaScimApi = tool({
  description: "Retrieves an individual Sentry organization member's details using the SCIM v2 API. Returns a SCIM-formatted user resource containing the member's ID, username (email), email addresses, name (givenName and familyName), active status, and Sentry organization role. **Requirements**: This endpoint requ",
  inputSchema: z.object({
    sentryToken: tokenField,
    memberId: z.string().describe("The SCIM member ID (organization member ID) of the user to retrieve. This is the same as the member ID returned by the List Organization Members endpoint."),
    organizationIdOrSlug: z.string().describe("The organization's unique identifier (ID) or human-readable slug (e.g., 'acme-corp' or '1234567')"),
  }),
  execute: async ({ sentryToken, memberId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/scim/v2/Users/${memberId}/`, { query: {  } });
  },
});

export const sentryUpdateExternalUserForOrganization = tool({
  description: "Updates attributes of an existing external user linkage (identified by `external_user_id`) within a Sentry organization (specified by `organization_id_or_slug`).",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.number().int().describe("The unique Sentry identifier of the external user record being updated. This typically matches the `external_user_id` path parameter."),
    userId: z.number().int().describe("The Sentry user ID to be linked or that is currently linked with this external user."),
    provider: z.enum(["github", "github_enterprise", "jira_server", "slack", "perforce", "gitlab", "msteams", "custom_scm"]).describe("The external identity provider platform. Supported values: `github`, `github_enterprise`, `jira_server`, `slack`, `perforce`, `gitlab`, `msteams`, `custom_scm`."),
    externalId: z.string().optional().describe("The user's unique identifier on the external provider's platform (e.g., 'U123ABC' for Slack, 'github_user_123' for GitHub). This is optional."),
    externalName: z.string().describe("The user's display name or username on the external provider platform (e.g., 'john.doe' or 'John Doe')."),
    integrationId: z.number().int().describe("The Sentry ID of the integration instance (e.g., a specific Slack workspace or GitHub organization integration) through which this external user is known."),
    externalUserId: z.number().int().describe("The unique identifier of the external user record within Sentry to update."),
    organizationIdOrSlug: z.string().describe("The unique identifier (numeric ID or string slug) of the Sentry organization to which the external user is linked."),
  }),
  execute: async ({ sentryToken, id, userId, provider, externalId, externalName, integrationId, externalUserId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/external-users/${externalUserId}/`, { body: { id: id, user_id: userId, provider: provider, external_id: externalId, external_name: externalName, integration_id: integrationId } });
  },
});

export const sentryUpdateOrganizationMemberRole = tool({
  description: "Updates a Sentry organization member's organization-level role (`orgRole`) and/or their team roles (`teamRoles`), ensuring the initiator has permissions equivalent to both the member's current and intended new `orgRole` if `orgRole` is being modified.",
  inputSchema: z.object({
    sentryToken: tokenField,
    orgRole: z.enum(["billing", "member", "manager", "owner", "admin"]).optional().describe("Sets the member's new organization-level role (e.g., 'billing' for payments, 'member' for event access, 'manager' for project/team admin, 'owner' for full control). The 'admin' role is not assignable on Business/Enterpri"),
    memberId: z.string().describe("The ID of the member whose roles are to be updated."),
    teamRoles: z.array(z.any()).optional().describe("List of team role assignments (each object specifying `teamSlug` and `role`). This list completely replaces existing team roles. An empty list (default) removes the member from all teams. Team roles: `contributor` (views"),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to which the member belongs."),
  }),
  execute: async ({ sentryToken, orgRole, memberId, teamRoles, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/members/${memberId}/`, { body: { role: orgRole, teams: teamRoles } });
  },
});

export const sentryUpdateUserEmail = tool({
  description: "Updates the primary email address for a Sentry user. The new email must already be added as a secondary email and be verified. **AUTHENTICATION REQUIREMENTS:** - Requires `user:write` scope - Typically requires a PERSONAL auth token (created from User Settings > Personal Tokens) - Internal integrati",
  inputSchema: z.object({
    sentryToken: tokenField,
    email: z.string().email().describe("The new primary email address to set for the user. This email must already be added as a secondary email to the user's account and be verified before it can be set as primary. The email must be in valid format (e.g., use"),
    userId: z.string().describe("The unique identifier of the Sentry user whose primary email address is to be updated. Can be the numerical user ID or 'me' for the authenticated user. NOTE: This endpoint requires user:write scope and typically requires"),
  }),
  execute: async ({ sentryToken, email, userId }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/users/${userId}/emails/`, { body: { email: email } });
  },
});
