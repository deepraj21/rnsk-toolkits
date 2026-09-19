// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { auraRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neo4jGetProject = tool({
    description:
        'Get an Aura project (tenant) by ID, including available instance configurations (regions, types, memory, storage, providers). Use before creating an instance.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        tenantId: z.string().describe('Project/tenant ID'),
    }),
    execute: async ({ neo4jCredentials, tenantId }) => {
        return auraRequest(neo4jCredentials, `/v1/tenants/${encodeURIComponent(tenantId)}`);
    },
});

export const neo4jGetProjectBeta = tool({
    description:
        'Get an Aura project (tenant) by ID via v1beta5, including instance configurations. May expose newer fields than v1.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        tenantId: z.string().describe('Project/tenant ID'),
    }),
    execute: async ({ neo4jCredentials, tenantId }) => {
        return auraRequest(neo4jCredentials, `/v1beta5/tenants/${encodeURIComponent(tenantId)}`);
    },
});

export const neo4jListProjects = tool({
    description:
        'List all Aura projects (tenants) with ID and name. Use to discover accessible projects.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
    }),
    execute: async ({ neo4jCredentials }) => {
        return auraRequest(neo4jCredentials, '/v1/tenants');
    },
});

export const neo4jListProjectUsers = tool({
    description:
        'List users in an Aura project with email, ID, and project roles. Use to audit team access.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        organizationId: z.string().describe('Organization ID'),
        projectId: z.string().describe('Project ID'),
    }),
    execute: async ({ neo4jCredentials, organizationId, projectId }) => {
        return auraRequest(
            neo4jCredentials,
            `/v1/organizations/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(projectId)}/users`,
        );
    },
});

export const neo4jGetOrganizationUser = tool({
    description:
        'Get an Aura organization user by ID: email, org roles, MFA status, last activity, project access. Use to verify membership or permissions.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        organizationId: z.string().describe('Organization ID'),
        userId: z.string().describe('User ID'),
    }),
    execute: async ({ neo4jCredentials, organizationId, userId }) => {
        return auraRequest(
            neo4jCredentials,
            `/v1/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}`,
        );
    },
});

export const neo4jListIpFilters = tool({
    description:
        'List IP filters of an Aura organization with CIDR allow lists and filtered entities. Use to audit network access rules.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        organizationId: z.string().describe('Organization ID'),
    }),
    execute: async ({ neo4jCredentials, organizationId }) => {
        return auraRequest(neo4jCredentials, `/v1/organizations/${encodeURIComponent(organizationId)}/ip-filters`);
    },
});

const allowEntry = z.object({
    address: z.string().describe('IP address or CIDR block'),
    prefixLen: z.number().int().min(0).max(128).describe('CIDR prefix length'),
    description: z.string().optional().describe('Entry description'),
});

export const neo4jUpdateIpFilter = tool({
    description:
        'Partially update an Aura organization IP filter: name, description, allow list, or enable/disable. Only provided fields change.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        organizationId: z.string().describe('Organization ID'),
        ipFilterId: z.string().describe('IP filter ID'),
        name: z.string().optional().describe('New filter name'),
        description: z.string().optional().describe('New filter description'),
        allowList: z.array(allowEntry).optional().describe('Replacement CIDR allow list'),
        filteringDisabled: z.boolean().optional().describe('True disables filtering (allows all traffic)'),
    }),
    execute: async ({ neo4jCredentials, organizationId, ipFilterId, name, description, allowList, filteringDisabled }) => {
        return auraRequest(
            neo4jCredentials,
            `/v1/organizations/${encodeURIComponent(organizationId)}/ip-filters/${encodeURIComponent(ipFilterId)}`,
            {
                method: 'PATCH',
                body: {
                    name,
                    description,
                    allow_list: allowList?.map((e) => ({
                        address: e.address,
                        prefix_len: e.prefixLen,
                        description: e.description,
                    })),
                    filtering_disabled: filteringDisabled,
                },
            },
        );
    },
});

export const neo4jListAgents = tool({
    description:
        'List Aura agents in a project with ID, name, database, privacy, endpoints, MCP status, and tools. Use to discover available agents.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        organizationId: z.string().describe('Organization ID'),
        projectId: z.string().describe('Project ID'),
    }),
    execute: async ({ neo4jCredentials, organizationId, projectId }) => {
        return auraRequest(
            neo4jCredentials,
            `/v1/organizations/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(projectId)}/agents`,
        );
    },
});
