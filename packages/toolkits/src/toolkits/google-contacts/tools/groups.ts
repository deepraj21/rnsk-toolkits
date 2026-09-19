// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleContactsTokenField, normalizeGroupId, peopleRequest } from './client.js';

export const createContactGroup = tool({
    description:
        'Creates a contact group with a unique name. Duplicate names return HTTP 409.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        name: z.string().min(1).describe('Group name, unique among your groups'),
        clientData: z.array(z.object({ key: z.string(), value: z.string() })).optional().describe('Custom key-value data'),
        readGroupFields: z.string().optional().describe("Response mask (default 'metadata,groupType,name')"),
    }),
    execute: async ({ googleContactsToken, name, clientData, readGroupFields }) => {
        try {
            const body: Record<string, unknown> = { contactGroup: { name } };
            if (clientData) (body.contactGroup as Record<string, unknown>).clientData = clientData;
            const result = await peopleRequest(googleContactsToken, '/contactGroups', {
                method: 'POST',
                query: { readGroupFields },
                body,
            });
            if (!result.ok) return { error: 'Failed to create contact group', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating contact group', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getContactGroup = tool({
    description:
        'Gets a contact group (name, member count, metadata) by resource name.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        contactGroupId: z.string().min(1).describe("Group ID or resource, e.g. 'myContacts' or 'contactGroups/abc'"),
        groupFields: z.string().optional().describe("Response mask (default 'metadata,groupType,memberCount,name')"),
        maxMembers: z.number().min(1).optional().describe('Max member names to include'),
    }),
    execute: async ({ googleContactsToken, contactGroupId, groupFields, maxMembers }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/${normalizeGroupId(contactGroupId)}`, {
                query: { groupFields, maxMembers },
            });
            if (!result.ok) return { error: 'Failed to get contact group', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting contact group', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const batchGetContactGroups = tool({
    description:
        'Gets up to 200 contact groups in one call — metadata, member counts, or member names.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceNames: z.array(z.string()).min(1).max(200).describe("Groups, e.g. ['contactGroups/myContacts']"),
        groupFields: z.string().optional().describe("Response mask, e.g. 'groupType,name,memberCount'"),
        maxMembers: z.number().min(0).optional().describe('Max members per group (unset returns all)'),
    }),
    execute: async ({ googleContactsToken, resourceNames, groupFields, maxMembers }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/contactGroups:batchGet', {
                query: { resourceNames, groupFields, maxMembers },
            });
            if (!result.ok) return { error: 'Failed to batch get contact groups', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error batch getting contact groups', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listContactGroups = tool({
    description:
        'Lists all your contact groups (My Contacts, Starred, custom). Members are not populated here.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        pageSize: z.number().min(1).max(1000).optional().describe('Groups per page (1-1000, default 30)'),
        pageToken: z.string().optional(),
        syncToken: z.string().optional().describe('Return only changes since this token'),
        groupFields: z.string().optional().describe("Response mask (default 'metadata,groupType,memberCount,name')"),
    }),
    execute: async ({ googleContactsToken, pageSize, pageToken, syncToken, groupFields }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/contactGroups', {
                query: { pageSize, pageToken, syncToken, groupFields },
            });
            if (!result.ok) return { error: 'Failed to list contact groups', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing contact groups', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const updateContactGroup = tool({
    description:
        'Renames a contact group or updates its client data. Needs resourceName, etag, and name.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceName: z.string().describe("Group resource, e.g. 'contactGroups/abc'"),
        etag: z.string().describe('Current etag for concurrency'),
        name: z.string().describe('New unique group name'),
        groupType: z.string().optional(),
        clientData: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
        readGroupFields: z.string().optional().describe('Response mask'),
        updateGroupFields: z.string().optional().describe("Fields to update, e.g. 'name,clientData'"),
    }),
    execute: async ({ googleContactsToken, resourceName, readGroupFields, updateGroupFields, ...group }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/${resourceName}`, {
                method: 'PUT',
                query: { readGroupFields, updateGroupFields },
                body: { contactGroup: { resourceName, ...group } },
            });
            if (!result.ok) return { error: 'Failed to update contact group', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error updating contact group', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteContactGroup = tool({
    description:
        'Deletes a contact group. Irreversible. Set deleteContacts to also delete its contacts.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        contactGroupId: z.string().min(1).describe("Group ID or resource, e.g. 'contactGroups/abc'"),
        deleteContacts: z.boolean().optional().describe('Also delete all contacts in the group (default false)'),
    }),
    execute: async ({ googleContactsToken, contactGroupId, deleteContacts }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/${normalizeGroupId(contactGroupId)}`, {
                method: 'DELETE',
                query: { deleteContacts },
            });
            if (!result.ok) return { error: 'Failed to delete contact group', details: result.error };
            return { success: true };
        } catch (error) {
            return { error: 'Error deleting contact group', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const modifyContactGroupMembers = tool({
    description:
        'Adds/removes group members (max 1000 combined). Only myContacts and starred accept new members; a contact must keep at least one group.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        contactGroupId: z.string().describe("Group ID, 'myContacts', 'starred', or full resource name"),
        resourceNamesToAdd: z.array(z.string()).optional().describe("Contacts to add, e.g. ['people/c1']"),
        resourceNamesToRemove: z.array(z.string()).optional().describe('Contacts to remove'),
    }),
    execute: async ({ googleContactsToken, contactGroupId, resourceNamesToAdd, resourceNamesToRemove }) => {
        try {
            const result = await peopleRequest(
                googleContactsToken,
                `/${normalizeGroupId(contactGroupId)}/members:modify`,
                { method: 'POST', body: { resourceNamesToAdd, resourceNamesToRemove } },
            );
            if (!result.ok) return { error: 'Failed to modify contact group members', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error modifying contact group members', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
