// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, harnessRequest, toHarnessError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Harness credentials JSON with apiKey and optional baseUrl, e.g. {"apiKey":"..."} (defaults to https://app.harness.io; EU uses https://app.eu.harness.io). Generate a token from your Harness user profile > My API Keys; service account tokens work too.',
    );
const accountField = z.string().describe('Harness account identifier (find it in any Harness URL: /account/ACCOUNT_ID/...)');
const scopeFields = {
    accountIdentifier: accountField,
    orgIdentifier: z.string().optional().describe('Organization identifier (omit for account-scoped resources)'),
    projectIdentifier: z.string().optional().describe('Project identifier (omit for org/account-scoped resources)'),
};
const pageFields = {
    page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
    size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
};

export const listOrganizations = tool({
    description:
        'List organizations in a Harness account. Use first to discover org identifiers before working with projects, pipelines or services.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        ...pageFields,
        searchTerm: z.string().optional().describe('Filter organizations by name or identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, page, size, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/organizations', {
                query: { accountIdentifier, page, size, searchTerm },
            });
            if (!result.ok) return failedResult('Failed to list Harness organizations', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness organizations');
        }
    },
});

export const getOrganization = tool({
    description: 'Get a single Harness organization by identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        identifier: z.string().describe('Organization identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/organizations/${encodeURIComponent(identifier)}`,
                { query: { accountIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness organization "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness organization "${identifier}"`);
        }
    },
});

export const createOrganization = tool({
    description: 'Create a Harness organization under an account.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        organization: z
            .record(z.any())
            .describe(
                'Organization object, e.g. {"identifier":"my_org","name":"My Org","description":"...","tags":{}}',
            ),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, organization }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/organizations', {
                method: 'POST',
                query: { accountIdentifier },
                body: { organization },
            });
            if (!result.ok) return failedResult('Failed to create Harness organization', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness organization');
        }
    },
});

export const updateOrganization = tool({
    description: 'Update a Harness organization. Pass the full organization object including its identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        identifier: z.string().describe('Organization identifier to update'),
        organization: z
            .record(z.any())
            .describe('Full organization object with updated fields'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, identifier, organization }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/organizations/${encodeURIComponent(identifier)}`,
                { method: 'PUT', query: { accountIdentifier }, body: { organization } },
            );
            if (!result.ok)
                return failedResult(`Failed to update Harness organization "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness organization "${identifier}"`);
        }
    },
});

export const deleteOrganization = tool({
    description: 'Delete a Harness organization and everything under it. This cannot be undone.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        identifier: z.string().describe('Organization identifier to delete'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/organizations/${encodeURIComponent(identifier)}`,
                { method: 'DELETE', query: { accountIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness organization "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness organization "${identifier}"`);
        }
    },
});

export const listProjects = tool({
    description:
        'List Harness projects, optionally scoped to an organization. Returns identifiers, names, modules and colors.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        orgIdentifier: z.string().optional().describe('Organization identifier to scope the listing'),
        ...pageFields,
        searchTerm: z.string().optional().describe('Filter projects by name or identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, page, size, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/projects', {
                query: { accountIdentifier, orgIdentifier, page, size, searchTerm },
            });
            if (!result.ok) return failedResult('Failed to list Harness projects', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness projects');
        }
    },
});

export const getProject = tool({
    description: 'Get a single Harness project by identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        orgIdentifier: z.string().describe('Organization identifier'),
        identifier: z.string().describe('Project identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/projects/${encodeURIComponent(identifier)}`,
                { query: { accountIdentifier, orgIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness project "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness project "${identifier}"`);
        }
    },
});

export const createProject = tool({
    description: 'Create a Harness project under an organization.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        orgIdentifier: z.string().describe('Organization identifier'),
        project: z
            .record(z.any())
            .describe(
                'Project object, e.g. {"identifier":"my_project","name":"My Project","color":"#0063F7","modules":["CD"],"description":"","tags":{}}',
            ),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, project }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/projects', {
                method: 'POST',
                query: { accountIdentifier, orgIdentifier },
                body: { project },
            });
            if (!result.ok) return failedResult('Failed to create Harness project', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness project');
        }
    },
});

export const updateProject = tool({
    description: 'Update a Harness project. Pass the full project object including its identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        orgIdentifier: z.string().describe('Organization identifier'),
        identifier: z.string().describe('Project identifier to update'),
        project: z.record(z.any()).describe('Full project object with updated fields'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, identifier, project }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/projects/${encodeURIComponent(identifier)}`,
                { method: 'PUT', query: { accountIdentifier, orgIdentifier }, body: { project } },
            );
            if (!result.ok)
                return failedResult(`Failed to update Harness project "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness project "${identifier}"`);
        }
    },
});

export const deleteProject = tool({
    description: 'Delete a Harness project and all resources under it. This cannot be undone.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        orgIdentifier: z.string().describe('Organization identifier'),
        identifier: z.string().describe('Project identifier to delete'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/projects/${encodeURIComponent(identifier)}`,
                { method: 'DELETE', query: { accountIdentifier, orgIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness project "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness project "${identifier}"`);
        }
    },
});

export const getCurrentUser = tool({
    description:
        'Get the Harness user the API token belongs to. Use to verify a token works and to check the login identity.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
    }),
    execute: async ({ harnessCredentials, accountIdentifier }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/user/currentUser', {
                query: { accountIdentifier },
            });
            if (!result.ok) return failedResult('Failed to get current Harness user', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error getting current Harness user');
        }
    },
});

export const listUsers = tool({
    description: 'List users in a Harness account with names, emails and group memberships.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        ...pageFields,
        searchTerm: z.string().optional().describe('Filter users by name or email'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, page, size, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/user/aggregate', {
                method: 'POST',
                query: { accountIdentifier, page, size },
                body: searchTerm ? { searchTerm } : {},
            });
            if (!result.ok) return failedResult('Failed to list Harness users', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness users');
        }
    },
});

export const listAuditEvents = tool({
    description:
        'List Harness audit trail events: who changed what resource and when. Use to investigate configuration changes, pipeline edits or permission grants.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        ...scopeFields,
        ...pageFields,
        filter: z
            .record(z.any())
            .optional()
            .describe(
                'Optional audit filter, e.g. {"principals":[{"type":"USER","identifier":"john.doe"}],"resources":[{"type":"PIPELINE"}]}',
            ),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        page,
        size,
        filter,
    }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/audit/api/audits/list', {
                method: 'POST',
                query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size },
                body: filter ?? {},
            });
            if (!result.ok) return failedResult('Failed to list Harness audit events', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness audit events');
        }
    },
});
