// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID").',
    );

export const listSettingSchemas = tool({
    description:
        'List Settings 2.0 schemas (builtin:alerting.profile, builtin:tags.auto-tagging, ...). Use to find schema IDs before reading or writing settings objects. Requires settings.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
    }),
    execute: async ({ dynatraceCredentials }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/settings/schemas');
            if (!result.ok) return failedResult('Failed to list Dynatrace settings schemas', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace settings schemas');
        }
    },
});

export const listSettingObjects = tool({
    description:
        'List Settings 2.0 objects, e.g. alerting profiles or auto-tag rules: filter by schemaIds like "builtin:alerting.profile" and scope. Requires settings.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        schemaIds: z
            .string()
            .optional()
            .describe('Comma-separated schema IDs, e.g. "builtin:alerting.profile,builtin:tags.auto-tagging"'),
        scopes: z.string().optional().describe('Comma-separated scopes, e.g. "environment"'),
        filter: z.string().optional().describe('Filter expression, e.g. \'name("My profile")\''),
        fields: z.string().optional().describe('Extra fields, e.g. "+value,+scope"'),
        sort: z.string().optional().describe('Sort, e.g. "schemaId" (prefix - for descending)'),
        pageSize: z.number().int().min(1).max(500).optional().describe('Results per page (default 100)'),
    }),
    execute: async ({ dynatraceCredentials, schemaIds, scopes, filter, fields, sort, pageSize }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/settings/objects', {
                query: { schemaIds, scopes, filter, fields, sort, pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace settings objects', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace settings objects');
        }
    },
});

export const getSettingObject = tool({
    description: 'Get one Settings 2.0 object with its value and scope. Requires settings.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        objectId: z.string().describe('Settings object ID (UUID)'),
    }),
    execute: async ({ dynatraceCredentials, objectId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/settings/objects/${encodeURIComponent(objectId)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Dynatrace settings object "${objectId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace settings object "${objectId}"`);
        }
    },
});

export const createSettingObject = tool({
    description:
        'Create Settings 2.0 object(s): alerting profiles, notification configs, auto-tags, maintenance windows. Requires settings.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        objects: z
            .array(z.record(z.any()))
            .describe(
                'Settings objects, e.g. [{"schemaId":"builtin:alerting.profile","scope":"environment","value":{"displayName":"My profile","rules":[]}}]',
            ),
        validateOnly: z.boolean().optional().describe('Only validate without saving (default false)'),
    }),
    execute: async ({ dynatraceCredentials, objects, validateOnly }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/settings/objects', {
                method: 'POST',
                query: { validateOnly },
                body: objects,
            });
            if (!result.ok) return failedResult('Failed to create Dynatrace settings object', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error creating Dynatrace settings object');
        }
    },
});

export const updateSettingObject = tool({
    description: 'Update a Settings 2.0 object value. Fetch it first with getSettingObject. Requires settings.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        objectId: z.string().describe('Settings object ID (UUID) to update'),
        value: z.record(z.any()).describe('Replacement value object for the schema'),
    }),
    execute: async ({ dynatraceCredentials, objectId, value }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/settings/objects/${encodeURIComponent(objectId)}`,
                { method: 'PUT', body: { value } },
            );
            if (!result.ok)
                return failedResult(`Failed to update Dynatrace settings object "${objectId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error updating Dynatrace settings object "${objectId}"`);
        }
    },
});

export const deleteSettingObject = tool({
    description: 'Delete a Settings 2.0 object. Requires settings.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        objectId: z.string().describe('Settings object ID (UUID) to delete'),
    }),
    execute: async ({ dynatraceCredentials, objectId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/settings/objects/${encodeURIComponent(objectId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Dynatrace settings object "${objectId}"`, result);
            return { success: true, objectId, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error deleting Dynatrace settings object "${objectId}"`);
        }
    },
});
