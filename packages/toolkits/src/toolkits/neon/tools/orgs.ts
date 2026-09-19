// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon, setNested } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonCreateApiKeyForOrganization = tool({
    description: "Creates a new API key for the specified organization in Neon. The API key is used for authenticating and authorizing access to the Neon API. The 'key_name' parameter allows for easy identification and management of multiple API keys within the organization. IMPORTANT: The actual API key value is returned only once in the response and cannot be retrieved later. Store it securely immediately after creation. Organization API keys provide admin-level access to all organization resources, including projects, members, and settings. Only organization admins can create these keys.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID. Can be found in the Organization Settings page."),
        keyName: z.string().describe("A user-specified name for the API key. Maximum length: 64 characters. This name helps identify and manage the key."),
    }),
    execute: async ({ neonApiKey, orgId, keyName }) => {
        const queryParams = undefined;
        const body = {};
        if (keyName !== undefined) setNested(body, 'key_name', keyName);
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/api_keys`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateNewApiKey = tool({
    description: "Creates a new personal API key for the authenticated Neon user account. Use this action to generate API keys for programmatic access to Neon services, such as CI/CD pipelines, backend integrations, or development environments. Each key should have a descriptive name to help identify its purpose. IMPORTANT: The returned 'key' value is shown only once - store it securely immediately after creation. To manage organization-level API keys, use the organization API key endpoints instead.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        keyName: z.string().describe("A user-specified name for the API key (e.g., 'production-backend', 'ci-cd-pipeline'). Used to identify the key in the Neon console. Must be non-empty."),
    }),
    execute: async ({ neonApiKey, keyName }) => {
        const queryParams = undefined;
        const body = {};
        if (keyName !== undefined) setNested(body, 'key_name', keyName);
        return neon(neonApiKey, { path: `/api_keys`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateVpcEndpointWithLabel = tool({
    description: "Assigns an AWS VPC endpoint to a Neon organization for Private Networking, or updates the label of an existing VPC endpoint assignment. This enables secure, private database connections through AWS PrivateLink without traversing the public internet. Requirements: - Organization must be on a Business or Enterprise plan - VPC endpoint must be created in your AWS account first - VPC endpoint must be in the same AWS region as your Neon project Use this action to: - Connect a new AWS VPC endpoint to your Neon organization - Update the descriptive label of an existing VPC endpoint assignment Returns the VPC endpoint details including its ID, label, region, and status.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        label: z.string().describe("A descriptive label for the VPC endpoint to help identify it within your organization (e.g., 'production-vpc', 'staging-database')."),
        orgId: z.string().describe("The Neon organization ID (e.g., 'org-bold-bonus-12345678'). Required for organizations on Business or Enterprise plans."),
        regionId: z.string().describe("The AWS region ID where the VPC endpoint is located (e.g., 'aws-us-east-1', 'aws-us-east-2', 'aws-eu-central-1'). Note: Azure regions are not supported for VPC endpoints."),
        vpcEndpointId: z.string().describe("The AWS VPC endpoint ID to assign to the Neon organization (e.g., 'vpce-0123456789abcdef0'). This must be a valid VPC endpoint created in your AWS account."),
    }),
    execute: async ({ neonApiKey, label, orgId, regionId, vpcEndpointId }) => {
        const queryParams = undefined;
        const body = {};
        if (label !== undefined) setNested(body, 'label', label);
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/vpc/region/${encodeURIComponent(regionId)}/vpc_endpoints/${encodeURIComponent(vpcEndpointId)}`, method: 'POST', query: queryParams, body });
    },
});

export const neonDeleteApiKeyById = tool({
    description: "Deletes a specific API key from the Neon platform. This endpoint should be used when you need to revoke access for a particular API key, such as when an employee leaves the organization or when you suspect the key has been compromised. The operation is irreversible, so use it with caution. Once deleted, any applications or services using this API key will lose access to Neon's API. This endpoint helps maintain the security of your Neon account by allowing you to manage and control API key access effectively.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        keyId: z.number().int().describe("The numeric ID of the API key to delete. You can obtain this ID from the list_api_keys action. Example: 2690219"),
    }),
    execute: async ({ neonApiKey, keyId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/api_keys/${encodeURIComponent(keyId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteOrganizationApiKey = tool({
    description: "Deletes a specific API key associated with an organization in the Neon platform. This endpoint is used to revoke access for a particular API key, enhancing security by removing unused or compromised keys. It should be used when an API key is no longer needed, when rotating keys for security purposes, or when an API key may have been exposed. Once deleted, the API key cannot be recovered, and any systems using this key will lose access to the Neon API. Ensure you have a backup or replacement key in place before deletion to avoid service interruptions.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        keyId: z.number().int().describe("The unique integer identifier of the API key to delete. This ID is returned when creating an API key or can be obtained from the list organization API keys endpoint."),
        orgId: z.string().describe("The Neon organization ID. Format: 'org-<adjective>-<noun>-<number>' (e.g., 'org-cool-breeze-12345678'). Can be obtained from the get user organizations endpoint."),
    }),
    execute: async ({ neonApiKey, keyId, orgId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/api_keys/${encodeURIComponent(keyId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteOrganizationMember = tool({
    description: "Removes a specific member from a Neon organization. This action permanently revokes the member's access to all organization resources. Use this when an employee leaves the company, changes roles, or their access needs to be revoked. Important notes: - This action cannot be undone; re-adding requires a new invitation - You cannot delete the last admin member of an organization - The member_id must be a valid UUID (not the user's email) - Requires admin permissions on the organization Use fetch_organization_members_by_id first to get valid member IDs.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID. Format: 'org-<name>-<id>' (e.g., 'org-my-company-12345678'). Can be retrieved using the get_user_organizations action."),
        memberId: z.string().describe("The unique identifier of the organization member to remove. Must be a valid UUID format (e.g., '46bbb36a-8e45-4f4a-93c0-03e39ca4204e'). Can be retrieved using the fetch_organization_members_by_id action."),
    }),
    execute: async ({ neonApiKey, orgId, memberId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteVpcEndpointByIds = tool({
    description: "Permanently deletes a VPC endpoint from a Neon organization in a specified AWS region. This removes the private network connection between your AWS VPC and Neon's service. IMPORTANT: This operation is irreversible. Once a VPC endpoint is deleted from a Neon organization, it cannot be re-added to the same organization. Use with caution. Requirements: - Organization must be on the Scale plan (VPC/Private Networking is not available on Free plan) - Only AWS regions are supported (not Azure) - The VPC endpoint must exist in the specified organization and region This action is useful when decommissioning private network connections or cleaning up unused VPC endpoints. Deleting a VPC endpoint will disrupt any applications relying on private connectivity through that endpoint.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID (e.g., 'org-abc-123'). This can be obtained from the get_user_organizations action."),
        regionId: z.string().describe("The AWS region ID where the VPC endpoint is located. Must be an AWS region (e.g., 'aws-us-east-1', 'aws-eu-central-1'). Azure regions are not supported for VPC endpoints."),
        vpcEndpointId: z.string().describe("The AWS VPC endpoint ID to delete (e.g., 'vpce-0abc123def456789'). This is the VPC endpoint ID from your AWS account."),
    }),
    execute: async ({ neonApiKey, orgId, regionId, vpcEndpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/vpc/region/${encodeURIComponent(regionId)}/vpc_endpoints/${encodeURIComponent(vpcEndpointId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonFetchOrganizationMembersById = tool({
    description: "Retrieves a list of all members associated with a specific organization in the Neon B2B SaaS integration platform. This endpoint allows you to fetch detailed information about the users or entities that belong to the organization, which is crucial for managing access, roles, and permissions within the platform. Use this endpoint when you need to review the current membership of an organization, audit user access, or gather member information for reporting purposes. The endpoint returns comprehensive member details, but it does not modify any data or provide information about non-member users. Keep in mind that for large organizations, the response may be paginated to manage the data volume efficiently.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID (e.g., 'org-holy-recipe-01602027'). Can be obtained from the Get User Organizations endpoint."),
    }),
    execute: async ({ neonApiKey, orgId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/members`, method: 'GET', query: queryParams });
    },
});

export const neonFetchVpcendpointDetailsById = tool({
    description: "Retrieves the current state and configuration details of a specific VPC endpoint assigned to a Neon organization. VPC endpoints enable private connectivity between your AWS VPC and Neon databases using AWS PrivateLink, bypassing the public internet. Prerequisites: - Organization must be on the Scale plan or higher (VPC Private Networking is not available on Free or Launch plans) - VPC endpoint must be previously assigned using 'create_vpc_endpoint_with_label' action Use cases: - Check the operational state of a VPC endpoint (new, accepted, available, pending, rejected) - View which projects are restricted to use this VPC endpoint - Verify endpoint configuration for compliance and security auditing - Troubleshoot private connectivity issues Note: This is a read-only endpoint. To modify VPC endpoint configuration, use 'create_vpc_endpoint_with_label' or 'delete_vpc_endpoint_by_ids' actions.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID. Format: 'org-xxxx-xxxx-xxxxxxxx'. Use the 'get_user_organizations' action to list available organization IDs. Note: VPC endpoints require Scale plan or higher."),
        regionId: z.string().describe("The Neon AWS region ID where the VPC endpoint is located. Valid values: 'aws-us-east-1', 'aws-us-east-2', 'aws-us-west-2', 'aws-eu-central-1', 'aws-eu-west-2', 'aws-ap-southeast-1', 'aws-ap-southeast-2', 'aws-sa-east-1'. Note: Azure regions are not supported for VPC endpoints."),
        vpcEndpointId: z.string().describe("The AWS VPC endpoint ID. Format: 'vpce-xxxxxxxxxxxxxxxxx' (e.g., 'vpce-1234567890abcdef0'). Use 'get_vpc_region_endpoints' action to list available VPC endpoints in a region."),
    }),
    execute: async ({ neonApiKey, orgId, regionId, vpcEndpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/vpc/region/${encodeURIComponent(regionId)}/vpc_endpoints/${encodeURIComponent(vpcEndpointId)}`, method: 'GET', query: queryParams });
    },
});

export const neonGetCurrentUserInformation = tool({
    description: "Retrieves the profile information for the currently authenticated user. This endpoint should be used when you need to access details about the user making the API request, such as their username, email, or other account-related information. It's particularly useful for personalizing user experiences or retrieving user-specific settings within the Neon platform. The endpoint doesn't accept any parameters, as it relies solely on the authentication token to identify the user. Note that this endpoint will only return information for the authenticated user and cannot be used to retrieve profiles of other users.",
    inputSchema: z.object({
        neonApiKey: tokenField,
    }),
    execute: async ({ neonApiKey }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/users/me`, method: 'GET', query: queryParams });
    },
});

export const neonGetOrganizationApiKeys = tool({
    description: "Retrieves a list of all API keys associated with a specific organization in the Neon B2B SaaS integration platform. This endpoint is crucial for administrators to manage and monitor API access within their organization. It provides a comprehensive view of all active API keys, enabling effective access control and security auditing. Use this endpoint when you need to review, track, or manage the API keys in use by your organization, such as during security reviews or when updating access permissions.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID"),
    }),
    execute: async ({ neonApiKey, orgId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/api_keys`, method: 'GET', query: queryParams });
    },
});

export const neonGetUserOrganizations = tool({
    description: "Retrieves a list of organizations associated with the currently authenticated user in the Neon platform. This endpoint allows users to view all the organizations they are a member of, providing essential information for managing multi-organization access and permissions. It should be used when a user needs to identify their organizational affiliations or when an application needs to determine a user's organization memberships for access control or data segregation purposes. The endpoint does not modify any data and is safe for frequent calls. Note that it only returns organizations the user is actively a member of and won't include pending invitations or previously left organizations.",
    inputSchema: z.object({
        neonApiKey: tokenField,
    }),
    execute: async ({ neonApiKey }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/users/me/organizations`, method: 'GET', query: queryParams });
    },
});

export const neonGetVpcRegionEndpoints = tool({
    description: "Retrieves a list of VPC endpoints for a specified organization within a particular AWS region. This endpoint allows developers to obtain information about the virtual network interfaces that enable private communication between a VPC and supported AWS services. It should be used when you need to audit, manage, or gather information about the existing VPC endpoints in a specific organizational context and geographic location. The endpoint provides a comprehensive view of how the organization's VPC is connected to various AWS services, which is crucial for network architecture planning and security audits. Note that this endpoint only lists the VPC endpoints; it does not provide detailed configuration information or allow for modifications to the endpoints.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID"),
        regionId: z.string().describe("The Neon region ID"),
    }),
    execute: async ({ neonApiKey, orgId, regionId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/vpc/region/${encodeURIComponent(regionId)}/vpc_endpoints`, method: 'GET', query: queryParams });
    },
});

export const neonListApiKeys = tool({
    description: "Retrieves a list of API keys associated with the authenticated user's Neon account. This endpoint allows developers to view and manage their existing API keys, which are crucial for authentication when making requests to the Neon API. It provides an overview of all active API keys, including their identifiers and potentially other metadata such as creation date or last used date. This tool should be used when you need to audit your API keys, check for any unauthorized keys, or before creating a new key to ensure you're not exceeding any limits. It does not provide the actual secret key values for security reasons, nor does it allow for the creation or deletion of keys.",
    inputSchema: z.object({
        neonApiKey: tokenField,
    }),
    execute: async ({ neonApiKey }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/api_keys`, method: 'GET', query: queryParams });
    },
});

export const neonListVpcVpcEndpoints = tool({
    description: "Tool to retrieve the list of VPC endpoints for a specified Neon organization across all regions. Use when you need to view or audit all VPC endpoints associated with an organization.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID"),
    }),
    execute: async ({ neonApiKey, orgId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/vpc/vpc_endpoints`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveAccountConsumptionHistory = tool({
    description: "Retrieves the consumption history for a specified account within the Neon platform. This endpoint provides detailed information about resource usage and associated costs over a given time period. It's particularly useful for analyzing usage patterns, forecasting future resource needs, and managing costs in the Neon B2B SaaS integration platform. The endpoint returns data such as compute time, storage usage, API calls, and any other billable resources specific to the Neon service. Users can specify a date range and optionally filter by resource types to get a granular view of their consumption. This tool should be used when detailed analytics on resource utilization and spending are required, such as for budget planning, usage optimization, or billing reconciliation. It does not provide real-time usage data and may have a slight delay in reflecting the most recent consumption.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        to: z.string().describe("Specify the end 'date-time' for the consumption period. The 'date-time' value is rounded according to the specified granularity. For example, '2024-03-15T15:30:00Z' for 'daily' granularity will be rounded to '2024-03-15T00:00:00Z'. The specified 'date-time' value must respect the specified granularity: - For 'hourly', consumption metrics are limited to the last 168 hours. - For 'daily', consumption metrics are limited to the last 60 days. - For 'monthly', consumption metrics are limited to the past year.  "),
        from: z.string().describe("Specify the start 'date-time' for the consumption period. The 'date-time' value is rounded according to the specified 'granularity'. For example, '2024-03-15T15:30:00Z' for 'daily' granularity will be rounded to '2024-03-15T00:00:00Z'. The specified 'date-time' value must respect the specified granularity: - For 'hourly', consumption metrics are limited to the last 168 hours. - For 'daily', consumption metrics are limited to the last 60 days. - For 'monthly', consumption metrics are limited to the past year. The consumption history is available starting from 'March 1, 2024, at 00:00:00 UTC'.  "),
        orgId: z.string().optional().describe("Specify the organization for which the consumption metrics should be returned. If this parameter is not provided, the endpoint will return the metrics for the authenticated user\"s account.  "),
        granularity: z.enum(["hourly", "daily", "monthly"]).describe("Specify the granularity of consumption metrics. Hourly, daily, and monthly metrics are available for the last 168 hours, 60 days, and 1 year, respectively.  "),
        includeV1Metrics: z.boolean().optional().describe("Include metrics utilized in previous pricing models. - **data_storage_bytes_hour**: The sum of the maximum observed storage values for each hour   for each project, which never decreases.  "),
    }),
    execute: async ({ neonApiKey, to, from, orgId, granularity, includeV1Metrics }) => {
        const queryParams = { to: to, from: from, org_id: orgId, granularity: granularity, include_v1_metrics: includeV1Metrics };
        return neon(neonApiKey, { path: `/consumption_history/account`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveOrganizationById = tool({
    description: "Retrieves detailed information about a specific organization within the Neon platform. This endpoint allows you to access comprehensive data about an organization, including its configuration, members, and associated projects. Use this when you need to view or verify an organization's current state, such as checking membership, reviewing settings, or auditing organization-level information. The endpoint returns a snapshot of the organization at the time of the request and does not provide historical data or future projections. It's particularly useful for administrative tasks, reporting, and maintaining organizational oversight within the Neon ecosystem.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID. Format: 'org-xxxx-xxxx-xxxxxxxx'. Use the 'get_user_organizations' action to list available organization IDs."),
    }),
    execute: async ({ neonApiKey, orgId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveOrganizationInvitations = tool({
    description: "Retrieves a list of all pending invitations for a specified organization. This endpoint allows organization administrators to view and manage outstanding invitations sent to potential new members. It should be used when there's a need to track who has been invited to join the organization, review invitation statuses, or perform invitation-related administrative tasks. The endpoint returns details about each invitation, which may include the invitee's email, the invitation date, and the current status. It does not provide information about active members or expired invitations.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID"),
    }),
    execute: async ({ neonApiKey, orgId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/invitations`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveOrganizationMemberInfo = tool({
    description: "Retrieves detailed information about a specific member within an organization in the Neon B2B SaaS integration platform. This endpoint allows you to fetch comprehensive data about an individual member, including their user ID, assigned role within the organization, join date, and potentially other relevant details. It's particularly useful for organization administrators who need to review or verify a member's status and permissions. The endpoint requires both the organization ID and the member ID to be specified, ensuring precise and secure access to member information. Use this when you need to access or display detailed information about a particular member in your organization management interfaces or for auditing purposes.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID (e.g., 'org-holy-recipe-01602027'). Can be obtained from the Get User Organizations endpoint."),
        memberId: z.string().describe("The Neon organization member ID (UUID format, e.g., '46bbb36a-8e45-4f4a-93c0-03e39ca4204e'). Can be obtained from the Fetch Organization Members endpoint."),
    }),
    execute: async ({ neonApiKey, orgId, memberId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`, method: 'GET', query: queryParams });
    },
});

export const neonSendOrganizationInvitations = tool({
    description: "Creates and sends invitations to join an organization in the Neon B2B SaaS integration platform. This endpoint allows administrators to invite multiple users simultaneously, specifying their email addresses and intended roles within the organization. It should be used when expanding the organization's membership or when assigning new roles to incoming members. The endpoint does not verify if the email addresses are associated with existing Neon accounts; it simply sends out invitations to the specified email addresses.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().describe("The Neon organization ID"),
        invitations: z.array(z.record(z.any())).describe("Invitations"),
    }),
    execute: async ({ neonApiKey, orgId, invitations }) => {
        const queryParams = undefined;
        const body = {};
        if (invitations !== undefined) setNested(body, 'invitations', invitations);
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/invitations`, method: 'POST', query: queryParams, body });
    },
});

export const neonTransferProjectsBetweenOrganizations = tool({
    description: "Transfers selected projects from one organization to another organization. Use this when you need to move projects between organizations, for example during organizational restructuring or mergers. Note that projects with GitHub or Vercel integrations cannot be transferred and will cause the request to fail.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectIds: z.array(z.string()).describe("The list of project IDs to transfer. Maximum of 400 project IDs per request. Each project ID must belong to the source organization and cannot have GitHub or Vercel integrations installed."),
        sourceOrgId: z.string().describe("The Neon organization ID that currently owns the projects (source organization). This is the organization from which projects will be transferred."),
        destinationOrgId: z.string().describe("The destination organization identifier to which the projects will be transferred. Must be a valid organization ID."),
    }),
    execute: async ({ neonApiKey, projectIds, sourceOrgId, destinationOrgId }) => {
        const queryParams = undefined;
        const body = {};
        if (destinationOrgId !== undefined) setNested(body, 'destination_org_id', destinationOrgId);
        if (projectIds !== undefined) setNested(body, 'project_ids', projectIds);
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(sourceOrgId)}/projects/transfer`, method: 'POST', query: queryParams, body });
    },
});

export const neonTransferUserProjectsToOrganization = tool({
    description: "Transfers multiple projects from the authenticated user's personal account to a specified organization within the Neon B2B SaaS integration platform. This endpoint allows for bulk transfer of projects, enabling efficient management of project ownership and organization. It should be used when reorganizing project structures or when moving projects from individual ownership to team or company-wide access. The endpoint is limited to transferring a maximum of 400 projects in a single request, which helps maintain system performance and prevents abuse. It's important to note that this operation is likely irreversible, so users should exercise caution and confirm the transfer details before execution.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectIds: z.array(z.string()).describe("List of project IDs to transfer from the user's personal account to the organization. Maximum of 400 project IDs per request. Projects must be owned by the user and cannot have GitHub or Vercel integrations."),
        destinationOrgId: z.string().describe("The unique identifier of the target organization to which the projects will be transferred. Must be an organization the user is a member of."),
    }),
    execute: async ({ neonApiKey, projectIds, destinationOrgId }) => {
        const queryParams = undefined;
        const body = {};
        if (destinationOrgId !== undefined) setNested(body, 'destination_org_id', destinationOrgId);
        if (projectIds !== undefined) setNested(body, 'project_ids', projectIds);
        return neon(neonApiKey, { path: `/projects/transfer`, method: 'POST', query: queryParams, body });
    },
});

export const neonUpdateOrganizationMemberRole = tool({
    description: "Updates the role of a specific member within an organization in the Neon B2B SaaS integration platform. This endpoint allows changing a member's role between 'admin' and 'member', which affects their permissions and access levels within the organization. Use this endpoint when you need to promote a regular member to an admin role or demote an admin to a regular member role. It's crucial for managing access control and permissions within your organization. Note that this operation may have significant implications on the member's ability to manage resources and other members within the organization.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        role: z.enum(["admin", "member"]).describe("The role of the organization member"),
        orgId: z.string().describe("The Neon organization ID"),
        memberId: z.string().describe("The Neon organization member ID"),
    }),
    execute: async ({ neonApiKey, role, orgId, memberId }) => {
        const queryParams = undefined;
        const body = {};
        if (role !== undefined) setNested(body, 'role', role);
        return neon(neonApiKey, { path: `/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`, method: 'PATCH', query: queryParams, body });
    },
});
