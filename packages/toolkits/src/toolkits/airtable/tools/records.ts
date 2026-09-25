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
const baseField = z.string().describe('Base ID, e.g. "appXXXXXXXXXXXXXX" (find it in the base API docs or via listBases)');
const tableField = z
    .string()
    .describe('Table ID or name, e.g. "tblXXXXXXXXXXXXXX" or "Tasks". Prefer IDs when the name contains special characters.');

export const listRecords = tool({
    description:
        'List records in an Airtable table with filtering (filterByFormula), sorting, field selection, views and pagination. Requires data.records:read scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        fields: z.array(z.string()).optional().describe('Only return these fields (names or IDs)'),
        filterByFormula: z
            .string()
            .optional()
            .describe('Airtable formula filter, e.g. \'{Status}="Done"\' or \'AND({Priority}="High",{Done}=0)\''),
        maxRecords: z.number().int().min(1).optional().describe('Max total records to return'),
        pageSize: z.number().int().min(1).max(100).optional().describe('Records per page (max 100)'),
        sort: z
            .array(z.object({ field: z.string(), direction: z.enum(['asc', 'desc']).optional() }))
            .optional()
            .describe('Sorts, e.g. [{"field":"Name","direction":"asc"}]'),
        view: z.string().optional().describe('View ID or name to limit and order results'),
        offset: z.string().optional().describe('Pagination offset from a previous response'),
        cellFormat: z.enum(['json', 'string']).optional().describe('Cell format (default json)'),
        timeZone: z.string().optional().describe('Timezone for string cell format, e.g. "America/New_York"'),
        userLocale: z.string().optional().describe('Locale for string cell format, e.g. "en-us"'),
        returnFieldsByFieldId: z.boolean().optional().describe('Return fields keyed by field ID instead of name'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, fields, filterByFormula, maxRecords, pageSize, sort, view, offset, cellFormat, timeZone, userLocale, returnFieldsByFieldId }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}`,
                {
                    query: {
                        filterByFormula,
                        maxRecords,
                        pageSize,
                        view,
                        offset,
                        cellFormat,
                        timeZone,
                        userLocale,
                        returnFieldsByFieldId,
                    },
                    repeatQuery: fields?.length ? { fields } : undefined,
                    indexedQuery: sort?.length ? { sort } : undefined,
                },
            );
            if (!result.ok) return failedResult('Failed to list Airtable records', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error listing Airtable records');
        }
    },
});

export const getRecord = tool({
    description: 'Get a single Airtable record by ID. Requires data.records:read scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        recordId: z.string().describe('Record ID, e.g. "recXXXXXXXXXXXXXX"'),
        cellFormat: z.enum(['json', 'string']).optional().describe('Cell format (default json)'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, recordId, cellFormat }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}/${encodeURIComponent(recordId)}`,
                { query: { cellFormat } },
            );
            if (!result.ok) return failedResult(`Failed to get Airtable record "${recordId}"`, result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, `Error getting Airtable record "${recordId}"`);
        }
    },
});

export const createRecords = tool({
    description:
        'Create up to 10 records in an Airtable table. Requires data.records:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        records: z
            .array(z.object({ fields: z.record(z.any()) }))
            .min(1)
            .max(10)
            .describe('Records to create, e.g. [{"fields":{"Name":"Alice","Status":"Todo"}}]'),
        typecast: z
            .boolean()
            .optional()
            .describe('Auto-convert values to the field type (e.g. strings to numbers)'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, records, typecast }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}`,
                { method: 'POST', body: { records, typecast } },
            );
            if (!result.ok) return failedResult('Failed to create Airtable records', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error creating Airtable records');
        }
    },
});

export const updateRecords = tool({
    description:
        'Update up to 10 records (PATCH: only the given fields change). Requires data.records:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        records: z
            .array(z.object({ id: z.string(), fields: z.record(z.any()) }))
            .min(1)
            .max(10)
            .describe('Records to update, e.g. [{"id":"recXXX","fields":{"Status":"Done"}}]'),
        typecast: z.boolean().optional().describe('Auto-convert values to the field type'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, records, typecast }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}`,
                { method: 'PATCH', body: { records, typecast } },
            );
            if (!result.ok) return failedResult('Failed to update Airtable records', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error updating Airtable records');
        }
    },
});

export const upsertRecords = tool({
    description:
        'Create or update up to 10 records matched on key fields (performUpsert). Records matching fieldsToMergeOn are updated, others created. Requires data.records:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        records: z
            .array(z.object({ id: z.string().optional(), fields: z.record(z.any()) }))
            .min(1)
            .max(10)
            .describe('Records with merge-key fields, e.g. [{"fields":{"Email":"a@x.com","Name":"A"}}]'),
        fieldsToMergeOn: z
            .array(z.string())
            .min(1)
            .describe('Field names/IDs used to match existing records, e.g. ["Email"]'),
        typecast: z.boolean().optional().describe('Auto-convert values to the field type'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, records, fieldsToMergeOn, typecast }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}`,
                {
                    method: 'PATCH',
                    body: { performUpsert: { fieldsToMergeOn }, records, typecast },
                },
            );
            if (!result.ok) return failedResult('Failed to upsert Airtable records', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error upserting Airtable records');
        }
    },
});

export const deleteRecords = tool({
    description: 'Delete one or more records (up to 10 per call) from an Airtable table. Requires data.records:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        recordIds: z
            .array(z.string())
            .min(1)
            .max(10)
            .describe('Record IDs to delete, e.g. ["recXXX","recYYY"]'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, recordIds }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}`,
                { method: 'DELETE', repeatQuery: { 'records[]': recordIds } },
            );
            if (!result.ok) return failedResult('Failed to delete Airtable records', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error deleting Airtable records');
        }
    },
});

export const listComments = tool({
    description: 'List comments on an Airtable record. Requires data.recordComments:read scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        recordId: z.string().describe('Record ID, e.g. "recXXXXXXXXXXXXXX"'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, recordId }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}/${encodeURIComponent(recordId)}/comments`,
            );
            if (!result.ok) return failedResult('Failed to list Airtable record comments', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error listing Airtable record comments');
        }
    },
});

export const createComment = tool({
    description:
        'Add a comment to an Airtable record. Mention users with @[userId] in the text. Requires data.recordComments:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        recordId: z.string().describe('Record ID to comment on'),
        text: z.string().describe('Comment text, e.g. "Reviewed — looks good @[usrXXX]"'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, recordId, text }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}/${encodeURIComponent(recordId)}/comments`,
                { method: 'POST', body: { text } },
            );
            if (!result.ok) return failedResult('Failed to create Airtable record comment', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error creating Airtable record comment');
        }
    },
});

export const updateComment = tool({
    description: 'Update the text of an Airtable record comment. Requires data.recordComments:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        recordId: z.string().describe('Record ID'),
        commentId: z.string().describe('Comment ID, e.g. "comXXXXXXXXXXXXXX"'),
        text: z.string().describe('Replacement comment text'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, recordId, commentId, text }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}/${encodeURIComponent(recordId)}/comments/${encodeURIComponent(commentId)}`,
                { method: 'PATCH', body: { text } },
            );
            if (!result.ok) return failedResult('Failed to update Airtable record comment', result);
            return result.data;
        } catch (error) {
            return toAirtableError(error, 'Error updating Airtable record comment');
        }
    },
});

export const deleteComment = tool({
    description: 'Delete a comment from an Airtable record. Requires data.recordComments:write scope.',
    inputSchema: z.object({
        airtableAccessToken: tokenField,
        baseId: baseField,
        tableIdOrName: tableField,
        recordId: z.string().describe('Record ID'),
        commentId: z.string().describe('Comment ID to delete'),
    }),
    execute: async ({ airtableAccessToken, baseId, tableIdOrName, recordId, commentId }) => {
        if (!airtableAccessToken) return missingTokenError();
        try {
            const result = await airtableRequest(
                airtableAccessToken,
                `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableIdOrName)}/${encodeURIComponent(recordId)}/comments/${encodeURIComponent(commentId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok) return failedResult('Failed to delete Airtable record comment', result);
            return { success: true, commentId, statusCode: result.status };
        } catch (error) {
            return toAirtableError(error, 'Error deleting Airtable record comment');
        }
    },
});
