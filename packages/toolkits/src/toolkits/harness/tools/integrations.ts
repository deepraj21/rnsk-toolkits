// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, harnessRequest, toHarnessError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Harness credentials JSON with apiKey and optional baseUrl, e.g. {"apiKey":"..."} (defaults to https://app.harness.io; EU uses https://app.eu.harness.io).',
    );
const accountField = z.string().describe('Harness account identifier');
const scopeFields = {
    accountIdentifier: accountField,
    orgIdentifier: z.string().optional().describe('Organization identifier (omit for account-scoped resources)'),
    projectIdentifier: z.string().optional().describe('Project identifier (omit for org/account-scoped resources)'),
};
const listFields = {
    page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
    size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
    searchTerm: z.string().optional().describe('Filter by name or identifier'),
};

export const listConnectors = tool({
    description:
        'List Harness connectors (cloud providers, artifact registries, code repos, secret managers) with type and connection status.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        ...listFields,
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/connectors', {
                query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm },
            });
            if (!result.ok) return failedResult('Failed to list Harness connectors', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness connectors');
        }
    },
});

export const getConnector = tool({
    description: 'Get a single Harness connector configuration by identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        identifier: z.string().describe('Connector identifier'),
        branch: z.string().optional().describe('Git branch for remote connectors'),
        repoIdentifier: z.string().optional().describe('Repository identifier for remote connectors'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, identifier, branch, repoIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/connectors/${encodeURIComponent(identifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier, branch, repoIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness connector "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness connector "${identifier}"`);
        }
    },
});

export const createConnector = tool({
    description:
        'Create a Harness connector (e.g. Docker registry, Kubernetes cluster, GitHub, AWS). Get the shape from getConnector on a similar connector.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        connector: z
            .record(z.any())
            .describe(
                'Connector object, e.g. {"identifier":"dockerhub","name":"dockerhub","type":"DockerRegistry","orgIdentifier":"default","spec":{...}}',
            ),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, connector }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/connectors', {
                method: 'POST',
                query: { accountIdentifier },
                body: { connector },
            });
            if (!result.ok) return failedResult('Failed to create Harness connector', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness connector');
        }
    },
});

export const updateConnector = tool({
    description: 'Update a Harness connector. Pass the full connector object including its identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        connector: z.record(z.any()).describe('Full connector object with updated fields'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, connector }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/connectors', {
                method: 'PUT',
                query: { accountIdentifier },
                body: { connector },
            });
            if (!result.ok) return failedResult('Failed to update Harness connector', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error updating Harness connector');
        }
    },
});

export const deleteConnector = tool({
    description: 'Delete a Harness connector. Pipelines and stages referencing it will fail until updated.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        identifier: z.string().describe('Connector identifier to delete'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/connectors/${encodeURIComponent(identifier)}`,
                { method: 'DELETE', query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness connector "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness connector "${identifier}"`);
        }
    },
});

export const listSecrets = tool({
    description:
        'List Harness secrets (metadata only — values are never returned). Use to discover secret identifiers for pipeline inputs.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        ...listFields,
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/v2/secrets', {
                query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size, searchTerm },
            });
            if (!result.ok) return failedResult('Failed to list Harness secrets', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness secrets');
        }
    },
});

export const getSecret = tool({
    description: 'Get Harness secret metadata by identifier (values are never exposed by the API).',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        identifier: z.string().describe('Secret identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/v2/secrets/${encodeURIComponent(identifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness secret "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness secret "${identifier}"`);
        }
    },
});

export const createSecret = tool({
    description:
        'Create a Harness text secret. Values are write-only and cannot be read back via the API.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        secret: z
            .record(z.any())
            .describe(
                'Secret object, e.g. {"type":"SecretText","identifier":"db_password","name":"db-password","orgIdentifier":"default","projectIdentifier":"my_project","spec":{"secretManagerIdentifier":"harnessSecretManager","valueType":"Inline","value":"s3cr3t"}}',
            ),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, secret }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ng/api/v2/secrets', {
                method: 'POST',
                query: { accountIdentifier },
                body: { secret },
            });
            if (!result.ok) return failedResult('Failed to create Harness secret', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness secret');
        }
    },
});

export const updateSecret = tool({
    description: 'Update a Harness secret value or metadata. Pass the full secret object.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        accountIdentifier: accountField,
        identifier: z.string().describe('Secret identifier to update'),
        secret: z.record(z.any()).describe('Full secret object with updated fields'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, identifier, secret }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/v2/secrets/${encodeURIComponent(identifier)}`,
                { method: 'PUT', query: { accountIdentifier }, body: { secret } },
            );
            if (!result.ok)
                return failedResult(`Failed to update Harness secret "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness secret "${identifier}"`);
        }
    },
});

export const deleteSecret = tool({
    description: 'Delete a Harness secret. Pipelines referencing it will fail until updated.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        identifier: z.string().describe('Secret identifier to delete'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/ng/api/v2/secrets/${encodeURIComponent(identifier)}`,
                { method: 'DELETE', query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness secret "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness secret "${identifier}"`);
        }
    },
});
