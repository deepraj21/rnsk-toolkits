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

export const listFeatureFlags = tool({
    description:
        'List Harness Feature Flags in a project with identifiers, state (on/off) and targeting. Use to discover flag identifiers before reading or toggling them.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
        size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, page, size }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/cf/admin/features', {
                query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size },
            });
            if (!result.ok) return failedResult('Failed to list Harness feature flags', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness feature flags');
        }
    },
});

export const getFeatureFlag = tool({
    description: 'Get a single Harness feature flag with its variations, targeting rules and current state.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        identifier: z.string().describe('Feature flag identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/cf/admin/features/${encodeURIComponent(identifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness feature flag "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness feature flag "${identifier}"`);
        }
    },
});

export const listSLOs = tool({
    description:
        'List Harness Service Reliability (SRM) SLOs in a project with error budgets and burn rates. Use to review reliability posture.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
        size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, page, size }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/cv/api/account/${encodeURIComponent(accountIdentifier)}/org/${encodeURIComponent(orgIdentifier)}/project/${encodeURIComponent(projectIdentifier)}/slo/v2`,
                { query: { page, size } },
            );
            if (!result.ok) return failedResult('Failed to list Harness SLOs', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness SLOs');
        }
    },
});

export const getSLO = tool({
    description: 'Get a single Harness SLO with objectives, error budget policy and monitored-service health sources.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        identifier: z.string().describe('SLO identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, identifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/cv/api/account/${encodeURIComponent(accountIdentifier)}/org/${encodeURIComponent(orgIdentifier)}/project/${encodeURIComponent(projectIdentifier)}/slo/v2/identifier/${encodeURIComponent(identifier)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness SLO "${identifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness SLO "${identifier}"`);
        }
    },
});

export const listCIBuilds = tool({
    description:
        'List Harness CI builds in a project with branch, commit, status and timing. Use to review build history and find failing builds.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
        size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
        branch: z.string().optional().describe('Filter builds by branch name'),
        searchTerm: z.string().optional().describe('Filter builds by search term'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, page, size, branch, searchTerm }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/ci/api/builds', {
                query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size, branch, searchTerm },
            });
            if (!result.ok) return failedResult('Failed to list Harness CI builds', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness CI builds');
        }
    },
});
