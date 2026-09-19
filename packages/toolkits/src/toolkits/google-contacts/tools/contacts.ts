// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleContactsTokenField, peopleRequest } from './client.js';

const sourcesField = z.array(z.string()).optional().describe('Source types mask (defaults to CONTACT + PROFILE)');

export const createContact = tool({
    description:
        'Creates one contact. Use batchCreateContacts for bulk. Only one entry per singleton field (names, birthdays, genders, biographies).',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        personFields: z.string().describe("Required read mask for the response, e.g. 'names,emailAddresses,phoneNumbers'"),
        sources: sourcesField,
        person: z.record(z.any()).optional().describe('Person fields: names, emailAddresses, phoneNumbers, addresses, organizations, etc.'),
        names: z.array(z.record(z.any())).optional().describe('Shortcut for person names'),
        emailAddresses: z.array(z.record(z.any())).optional().describe('Shortcut for emails'),
        phoneNumbers: z.array(z.record(z.any())).optional().describe('Shortcut for phones'),
    }),
    execute: async ({ googleContactsToken, personFields, sources, person, names, emailAddresses, phoneNumbers }) => {
        try {
            const body: Record<string, unknown> = { ...(person ?? {}) };
            if (names) body.names = names;
            if (emailAddresses) body.emailAddresses = emailAddresses;
            if (phoneNumbers) body.phoneNumbers = phoneNumbers;
            const result = await peopleRequest(googleContactsToken, '/people:createContact', {
                method: 'POST',
                query: { personFields, sources },
                body,
            });
            if (!result.ok) return { error: 'Failed to create contact', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating contact', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const batchCreateContacts = tool({
    description:
        'Creates up to 200 contacts in one call. Each contact needs a contactPerson wrapper. Send mutates for the same user sequentially.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        contacts: z.array(z.record(z.any())).min(1).max(200).describe("Contacts with 'contactPerson' Person data"),
        readMask: z.string().describe("Response fields, e.g. 'names,emailAddresses,phoneNumbers' (empty skips person data)"),
        sources: sourcesField,
    }),
    execute: async ({ googleContactsToken, contacts, readMask, sources }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/people:batchCreateContacts', {
                method: 'POST',
                body: { contacts, readMask, sources },
            });
            if (!result.ok) return { error: 'Failed to batch create contacts', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error batch creating contacts', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const updateContact = tool({
    description:
        'Updates a contact. Only updatePersonFields change; etag is required for concurrency. One entry per singleton field.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceName: z.string().describe("Contact resource, e.g. 'people/c123'"),
        updatePersonFields: z.string().describe("Fields to update, e.g. 'names,emailAddresses,phoneNumbers'"),
        person: z.record(z.any()).describe('Person data including required etag'),
        personFields: z.string().optional().describe('Response fields mask'),
        sources: sourcesField,
    }),
    execute: async ({ googleContactsToken, resourceName, updatePersonFields, person, personFields, sources }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/people/${resourceName}:updateContact`, {
                method: 'PATCH',
                query: { updatePersonFields, personFields, sources },
                body: person,
            });
            if (!result.ok) return { error: 'Failed to update contact', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error updating contact', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const batchUpdateContacts = tool({
    description:
        'Updates up to 200 contacts at once. Map resource names to Person data with etags; updateMask selects fields, readMask selects response fields.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        contacts: z.record(z.any()).describe('Map of resource name → Person data (include etag per contact)'),
        updateMask: z.string().describe("Fields to update, e.g. 'names,phoneNumbers,emailAddresses'"),
        readMask: z.string().describe('Response fields (empty returns no person data)'),
        sources: sourcesField,
    }),
    execute: async ({ googleContactsToken, contacts, updateMask, readMask, sources }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/people:batchUpdateContacts', {
                method: 'POST',
                body: { contacts, updateMask, readMask, sources },
            });
            if (!result.ok) return { error: 'Failed to batch update contacts', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error batch updating contacts', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteContact = tool({
    description:
        'Permanently deletes a contact. Irreversible — non-contact data is preserved.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceName: z.string().describe("Contact resource, e.g. 'people/c123'"),
    }),
    execute: async ({ googleContactsToken, resourceName }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/people/${resourceName}:deleteContact`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete contact', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting contact', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const batchDeleteContacts = tool({
    description:
        'Deletes up to 500 contacts in one call. Irreversible.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceNames: z.array(z.string()).min(1).max(500).describe("Contacts to delete, e.g. ['people/c1','people/c2']"),
    }),
    execute: async ({ googleContactsToken, resourceNames }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/people:batchDeleteContacts', {
                method: 'POST',
                body: { resourceNames },
            });
            if (!result.ok) return { error: 'Failed to batch delete contacts', details: result.error };
            return { success: true, deletedCount: resourceNames.length };
        } catch (error) {
            return { error: 'Error batch deleting contacts', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getPerson = tool({
    description:
        "Gets a person by resource name ('people/me' for yourself). personFields is required.",
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceName: z.string().describe("Person resource, e.g. 'people/me' or 'people/123'"),
        personFields: z.string().describe("Required response mask, e.g. 'names,emailAddresses,phoneNumbers'"),
        sources: sourcesField,
        requestMaskIncludeField: z.string().optional().describe('Extra person fields to include'),
    }),
    execute: async ({ googleContactsToken, resourceName, personFields, sources, requestMaskIncludeField }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/people/${resourceName}`, {
                query: { personFields, sources, 'requestMask.includeField': requestMaskIncludeField },
            });
            if (!result.ok) return { error: 'Failed to get person', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting person', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const batchGetPeople = tool({
    description:
        'Fetches up to 200 people in one call. Missing people return a status without person data.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceNames: z.array(z.string()).min(1).max(200).describe("People to fetch, e.g. ['people/me']"),
        personFields: z.string().describe('Required response mask'),
        sources: sourcesField,
    }),
    execute: async ({ googleContactsToken, resourceNames, personFields, sources }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/people:batchGet', {
                query: { resourceNames, personFields, sources },
            });
            if (!result.ok) return { error: 'Failed to batch get people', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error batch getting people', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listConnections = tool({
    description:
        'Lists your contacts with sorting, filtering, and incremental sync. Sync tokens expire after 7 days (410). Deleted contacts have metadata.deleted=true.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        personId: z.string().optional().describe("Whose connections (only 'people/me' is valid, default me)"),
        personFields: z.string().optional().describe("Response mask (default 'names,emailAddresses,phoneNumbers')"),
        pageSize: z.number().min(1).max(1000).optional(),
        pageToken: z.string().optional().describe('Next page token (other params must match first call)'),
        syncToken: z.string().optional().describe('Incremental sync token (other params must match)'),
        requestSyncToken: z.boolean().optional().describe('Return nextSyncToken on the last page'),
        sortOrder: z.enum(['LAST_MODIFIED_ASCENDING', 'LAST_MODIFIED_DESCENDING', 'FIRST_NAME_ASCENDING', 'LAST_NAME_ASCENDING']).optional(),
    }),
    execute: async ({ googleContactsToken, personId, personFields, pageSize, pageToken, syncToken, requestSyncToken, sortOrder }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/people/${personId ?? 'me'}/connections`, {
                query: { personFields: personFields ?? 'names,emailAddresses,phoneNumbers', pageSize, pageToken, syncToken, requestSyncToken, sortOrder },
            });
            if (!result.ok) return { error: 'Failed to list connections', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing connections', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const searchContacts = tool({
    description:
        'Searches your contacts by name, nickname, email, phone, or organization. Send an empty-query warmup first to refresh the cache.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        query: z.string().describe('Plain-text query (empty string warms the cache)'),
        readMask: z.string().optional().describe("Response mask (default 'names,emailAddresses,phoneNumbers')"),
        pageSize: z.number().min(0).max(100).optional().describe('Results to return (0-100, >30 capped to 30)'),
        sources: z.array(z.enum(['CONTACT', 'PROFILE'])).optional(),
    }),
    execute: async ({ googleContactsToken, query, readMask, pageSize, sources }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/people:searchContacts', {
                query: { query, readMask: readMask ?? 'names,emailAddresses,phoneNumbers', pageSize, sources },
            });
            if (!result.ok) return { error: 'Failed to search contacts', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error searching contacts', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const copyOtherContactToMyContacts = tool({
    description:
        'Copies an auto-created Other contact into your permanent myContacts group, selecting fields via copyMask.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        otherContactsId: z.string().describe("Other contact ID, e.g. 'c3784554018371489636'"),
        copyMask: z.array(z.enum(['emailAddresses', 'names', 'phoneNumbers'])).describe('Fields to copy'),
        readMask: z.string().optional().describe('Response mask (defaults to copyMask plus metadata/membership)'),
        sources: sourcesField,
    }),
    execute: async ({ googleContactsToken, otherContactsId, copyMask, readMask, sources }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/otherContacts/${otherContactsId}:copyToMyContactsGroup`, {
                method: 'POST',
                query: { readMask, sources },
                body: { copyMask },
            });
            if (!result.ok) return { error: 'Failed to copy other contact', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error copying other contact', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
