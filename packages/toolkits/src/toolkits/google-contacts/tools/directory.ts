// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleContactsTokenField, peopleRequest } from './client.js';

export const listDirectoryPeople = tool({
    description:
        'Lists Workspace domain profiles and contacts. Deleted entries have metadata.deleted=true on sync. Not for read-after-write.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        readMask: z.string().describe("Response mask, e.g. 'names,emailAddresses'"),
        sources: z.array(z.string()).min(1).describe("Sources: 'DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT' and/or 'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'"),
        pageSize: z.number().min(1).max(1000).optional().describe('People per page (max 1000, default 100)'),
        pageToken: z.string().optional(),
        syncToken: z.string().optional().describe('Incremental sync token'),
        requestSyncToken: z.boolean().optional(),
        mergeSources: z.array(z.string()).optional().describe('Extra directory sources to merge'),
    }),
    execute: async ({ googleContactsToken, ...query }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/people:listDirectoryPeople', { query });
            if (!result.ok) return { error: 'Failed to list directory people', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing directory people', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const searchDirectoryPeople = tool({
    description:
        'Searches the Workspace domain directory by name/email prefix. Requires directory.readonly scope.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        query: z.string().describe('Prefix query, e.g. a name or email'),
        readMask: z.string().describe("Response mask, e.g. 'names,emailAddresses,phoneNumbers'"),
        sources: z.array(z.enum(['DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT', 'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'])).min(1),
        pageSize: z.number().min(1).max(500).optional().describe('Results per page (max 500, default 25)'),
        pageToken: z.string().optional().describe('Must match first call params'),
        mergeSources: z.array(z.string()).optional(),
    }),
    execute: async ({ googleContactsToken, ...body }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/people:searchDirectoryPeople', {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to search directory people', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error searching directory people', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listOtherContacts = tool({
    description:
        'Lists auto-created Other contacts (from email interactions) outside your groups. Sync tokens expire after 7 days.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        readMask: z.string().describe("Response mask, e.g. 'names,emailAddresses,phoneNumbers'"),
        pageSize: z.number().min(1).max(1000).optional().describe('Contacts per page (max 1000, default 25)'),
        pageToken: z.string().optional().describe('Must match first call params'),
        syncToken: z.string().optional().describe('Incremental sync (params must match)'),
        requestSyncToken: z.boolean().optional(),
        sources: z.array(z.string()).optional(),
    }),
    execute: async ({ googleContactsToken, ...query }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/otherContacts', { query });
            if (!result.ok) return { error: 'Failed to list other contacts', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing other contacts', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const searchOtherContacts = tool({
    description:
        'Prefix-searches Other contacts by name, email, or phone. Send an empty-query warmup first for fresh results.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        query: z.string().describe("Prefix query, e.g. 'John' (empty warms the cache)"),
        readMask: z.string().describe("Response mask, e.g. 'names,emailAddresses,phoneNumbers'"),
        pageSize: z.number().min(1).max(30).optional().describe('Results per page (max 30, default 25)'),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleContactsToken, ...query }) => {
        try {
            const result = await peopleRequest(googleContactsToken, '/otherContacts:search', { query });
            if (!result.ok) return { error: 'Failed to search other contacts', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error searching other contacts', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
