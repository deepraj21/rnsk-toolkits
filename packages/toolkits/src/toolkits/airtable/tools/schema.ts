// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    airtableRequest,
    failedResult,
    missingTokenError,
    toAirtableError,
} from './client.js';

const tokenField = z
    .string()
    .optional()
    .describe('Injected Airtable access token (personal access token). Do not ask the user for it.');

export const listBases = tool({
    description:
        'List all bases the token can access with IDs, names and permission levels. Start here to discover base IDs. Requires schema.bases:read scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
    }),
    execute: async ({ airtableAccessToken }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(airtableAccessToken, '/v0/meta/bases');
            if (!result.ok) return failedResult('Failed to list Airtable bases', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error listing Airtable bases');
        }
    },
});

export const getBaseSchema = tool({
    description:
        'Get a base schema: tables with IDs, names, fields (IDs, types, options) and views. Use before reading/writing records to learn field names and types. Requires schema.bases:read scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: z.string().describe('Base ID, e.g. "appXXXXXXXXXXXXXX"'),
    }),
    execute: async ({ airtableAccessToken, baseId }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/meta/bases/${encodeURIComponent(baseId)}/tables`,
            );
            if (!result.ok) return failedResult(`Failed to get schema of base "${baseId}"`, result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, `Error getting schema of base "${baseId}"`);
        }
    },
});

export const createTable = tool({
    description:
        'Create a table in a base with fields. The first field becomes the primary field. Requires schema.bases:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: z.string().describe('Base ID'),
        name: z.string().describe('Table name, e.g. "Apartments"'),
        description: z.string().optional().describe('Table description'),
        fields: z
            .array(z.object({ name: z.string(), type: z.string(), description: z.string().optional(), options: z.record(z.any()).optional() }))
            .min(1)
            .describe(
                'Fields, e.g. [{"name":"Name","type":"singleLineText"},{"name":"Visited","type":"checkbox","options":{"color":"greenBright","icon":"check"}}]. See Airtable field-type docs for write formats.',
            ),
    }),
    execute: async ({ airtableAccessToken, baseId, name, description, fields }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/meta/bases/${encodeURIComponent(baseId)}/tables`,
                { method: 'POST', body: { name, description, fields } },
            );
            if (!result.ok) return failedResult('Failed to create Airtable table', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error creating Airtable table');
        }
    },
});

export const updateTable = tool({
    description: 'Rename a table or change its description. Requires schema.bases:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: z.string().describe('Base ID'),
        tableId: z.string().describe('Table ID, e.g. "tblXXXXXXXXXXXXXX"'),
        name: z.string().optional().describe('New table name'),
        description: z.string().optional().describe('New table description'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableId, name, description }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/meta/bases/${encodeURIComponent(baseId)}/tables/${encodeURIComponent(tableId)}`,
                { method: 'PATCH', body: { name, description } },
            );
            if (!result.ok) return failedResult('Failed to update Airtable table', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error updating Airtable table');
        }
    },
});

export const createField = tool({
    description:
        'Add a field (column) to a table. Requires schema.bases:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: z.string().describe('Base ID'),
        tableId: z.string().describe('Table ID'),
        name: z.string().describe('Field name, e.g. "Due date"'),
        type: z
            .string()
            .describe(
                'Field type, e.g. "singleLineText", "number", "checkbox", "date", "singleSelect", "multipleSelects", "attachment" (use "multipleAttachments"), "url", "email", "phoneNumber", "formula", "rollup", "multipleRecordLinks"',
            ),
        description: z.string().optional().describe('Field description'),
        options: z
            .record(z.any())
            .optional()
            .describe(
                'Type options, e.g. {"choices":[{"name":"Todo"},{"name":"Done"}]} for selects, {"precision":0} for numbers, {"color":"greenBright","icon":"check"} for checkboxes',
            ),
    }),
    execute: async ({ airtableAccessToken, baseId, tableId, name, type, description, options }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/meta/bases/${encodeURIComponent(baseId)}/tables/${encodeURIComponent(tableId)}/fields`,
                { method: 'POST', body: { name, type, description, options } },
            );
            if (!result.ok) return failedResult('Failed to create Airtable field', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error creating Airtable field');
        }
    },
});

export const updateField = tool({
    description:
        'Update a field name, description or options (e.g. add select choices). Requires schema.bases:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: z.string().describe('Base ID'),
        tableId: z.string().describe('Table ID'),
        fieldId: z.string().describe('Field ID, e.g. "fldXXXXXXXXXXXXXX"'),
        name: z.string().optional().describe('New field name'),
        description: z.string().optional().describe('New field description'),
        options: z.record(z.any()).optional().describe('New type options'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableId, fieldId, name, description, options }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/meta/bases/${encodeURIComponent(baseId)}/tables/${encodeURIComponent(tableId)}/fields/${encodeURIComponent(fieldId)}`,
                { method: 'PATCH', body: { name, description, options } },
            );
            if (!result.ok) return failedResult('Failed to update Airtable field', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error updating Airtable field');
        }
    },
});
