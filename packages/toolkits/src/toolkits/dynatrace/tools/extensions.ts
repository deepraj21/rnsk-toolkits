// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID").',
    );

export const listExtensions = tool({
    description:
        'List Extensions 2.0 available in the environment with versions and monitoring-configuration status. Requires extensions.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        name: z.string().optional().describe('Filter by extension name substring'),
    }),
    execute: async ({ dynatraceCredentials, name }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/extensions', {
                query: { name },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace extensions', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace extensions');
        }
    },
});

export const listExtensionVersions = tool({
    description: 'List all uploaded versions of one extension. Requires extensions.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        extensionName: z.string().describe('Extension name, e.g. "custom:elasticsearch"'),
    }),
    execute: async ({ dynatraceCredentials, extensionName }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/extensions/${encodeURIComponent(extensionName)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to list versions of extension "${extensionName}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error listing versions of extension "${extensionName}"`);
        }
    },
});

export const getExtension = tool({
    description: 'Get one extension version with data sources, alerts and properties. Requires extensions.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        extensionName: z.string().describe('Extension name, e.g. "custom:elasticsearch"'),
        extensionVersion: z.string().describe('Extension version, e.g. "1.0.0"'),
    }),
    execute: async ({ dynatraceCredentials, extensionName, extensionVersion }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/extensions/${encodeURIComponent(extensionName)}/${encodeURIComponent(extensionVersion)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get extension "${extensionName}" version "${extensionVersion}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting extension "${extensionName}"`);
        }
    },
});

export const deleteExtension = tool({
    description: 'Delete one extension version. Requires extensions.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        extensionName: z.string().describe('Extension name to delete'),
        extensionVersion: z.string().describe('Extension version to delete'),
    }),
    execute: async ({ dynatraceCredentials, extensionName, extensionVersion }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/extensions/${encodeURIComponent(extensionName)}/${encodeURIComponent(extensionVersion)}`,
                { method: 'DELETE' },
            );
            if (!result.ok)
                return failedResult(`Failed to delete extension "${extensionName}"`, result);
            return { success: true, extensionName, extensionVersion, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error deleting extension "${extensionName}"`);
        }
    },
});

export const listSyntheticMonitors = tool({
    description:
        'List synthetic monitors (browser, HTTP, clickpath) with enabled state and locations. Use to audit uptime coverage.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        type: z
            .string()
            .optional()
            .describe('Filter by monitor type, e.g. "BROWSER", "HTTP", "SYNTHETIC_TEST"'),
    }),
    execute: async ({ dynatraceCredentials, type }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v1/synthetic/monitors', {
                query: { type },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace synthetic monitors', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace synthetic monitors');
        }
    },
});

export const getSyntheticMonitor = tool({
    description: 'Get the full configuration of one synthetic monitor by entity ID.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        monitorId: z.string().describe('Synthetic monitor entity ID, e.g. "SYNTHETIC_TEST-..."'),
    }),
    execute: async ({ dynatraceCredentials, monitorId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v1/synthetic/monitors/${encodeURIComponent(monitorId)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get synthetic monitor "${monitorId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting synthetic monitor "${monitorId}"`);
        }
    },
});
