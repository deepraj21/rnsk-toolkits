// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, harnessRequest, toHarnessError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Harness credentials JSON with apiKey and optional baseUrl, e.g. {"apiKey":"..."} (defaults to https://app.harness.io; EU uses https://app.eu.harness.io).',
    );
const scopeFields = {
    accountIdentifier: z.string().describe('Harness account identifier'),
    orgIdentifier: z.string().describe('Organization identifier'),
    projectIdentifier: z.string().describe('Project identifier'),
};
const listFields = {
    page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
    size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
    searchTerm: z.string().optional().describe('Filter by name or identifier'),
};

export const listServices = tool({
    description:
        'List services in a Harness project. Use to discover service identifiers before running pipelines or editing service definitions.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        ...listFields,
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/servicesV2', {
                query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm },
            });
            if (!result.ok) return failedResult('Failed to list Harness services', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness services');
        }
    },
});

export const getService = tool({
    description: 'Get a single Harness service definition by identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        serviceIdentifier: z.string().describe('Service identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/servicesV2/${encodeURIComponent(serviceIdentifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness service "${serviceIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness service "${serviceIdentifier}"`);
        }
    },
});

export const createService = tool({
    description:
        'Create a Harness service from its service YAML. Fetch an example with getService and adapt name, identifier and artifacts.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        serviceYaml: z
            .string()
            .describe('Complete service YAML document starting with "service:"'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, serviceYaml }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/servicesV2', {
                method: 'POST',
                query: { accountIdentifier, orgIdentifier, projectIdentifier },
                body: serviceYaml,
                contentType: 'application/yaml',
            });
            if (!result.ok) return failedResult('Failed to create Harness service', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness service');
        }
    },
});

export const updateService = tool({
    description: 'Update a Harness service by replacing its service YAML.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        serviceIdentifier: z.string().describe('Service identifier to update'),
        serviceYaml: z.string().describe('Complete replacement service YAML document'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier, serviceYaml }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/servicesV2', {
                method: 'PUT',
                query: { accountIdentifier, orgIdentifier, projectIdentifier },
                body: serviceYaml,
                contentType: 'application/yaml',
                // identifier travels in the YAML document for V2 updates
            });
            void serviceIdentifier;
            if (!result.ok)
                return failedResult(`Failed to update Harness service "${serviceIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness service "${serviceIdentifier}"`);
        }
    },
});

export const deleteService = tool({
    description: 'Delete a Harness service. Pipelines referencing it will fail until updated.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        serviceIdentifier: z.string().describe('Service identifier to delete'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/servicesV2/${encodeURIComponent(serviceIdentifier)}`,
                { method: 'DELETE', query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness service "${serviceIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness service "${serviceIdentifier}"`);
        }
    },
});

export const listEnvironments = tool({
    description:
        'List environments in a Harness project. Use to discover environment identifiers for deployments.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        ...listFields,
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/environmentsV2', {
                query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm },
            });
            if (!result.ok) return failedResult('Failed to list Harness environments', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness environments');
        }
    },
});

export const getEnvironment = tool({
    description: 'Get a single Harness environment definition by identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        environmentIdentifier: z.string().describe('Environment identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/environmentsV2/${encodeURIComponent(environmentIdentifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness environment "${environmentIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness environment "${environmentIdentifier}"`);
        }
    },
});

export const createEnvironment = tool({
    description:
        'Create a Harness environment from its environment YAML. Fetch an example with getEnvironment and adapt name, identifier and infrastructure definitions.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        environmentYaml: z
            .string()
            .describe('Complete environment YAML document starting with "environment:"'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, environmentYaml }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/environmentsV2', {
                method: 'POST',
                query: { accountIdentifier, orgIdentifier, projectIdentifier },
                body: environmentYaml,
                contentType: 'application/yaml',
            });
            if (!result.ok) return failedResult('Failed to create Harness environment', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness environment');
        }
    },
});

export const updateEnvironment = tool({
    description: 'Update a Harness environment by replacing its environment YAML.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        environmentIdentifier: z.string().describe('Environment identifier to update'),
        environmentYaml: z.string().describe('Complete replacement environment YAML document'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier, environmentYaml }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/environmentsV2', {
                method: 'PUT',
                query: { accountIdentifier, orgIdentifier, projectIdentifier },
                body: environmentYaml,
                contentType: 'application/yaml',
            });
            void environmentIdentifier;
            if (!result.ok)
                return failedResult(`Failed to update Harness environment "${environmentIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness environment "${environmentIdentifier}"`);
        }
    },
});

export const deleteEnvironment = tool({
    description: 'Delete a Harness environment. Pipelines referencing it will fail until updated.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        environmentIdentifier: z.string().describe('Environment identifier to delete'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/environmentsV2/${encodeURIComponent(environmentIdentifier)}`,
                { method: 'DELETE', query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness environment "${environmentIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness environment "${environmentIdentifier}"`);
        }
    },
});
