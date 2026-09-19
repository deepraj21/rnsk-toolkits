// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { googleContactsTokenField, peopleRequest } from './client.js';

export const updateContactPhoto = tool({
    description:
        'Sets a contact photo from base64 bytes (JPEG, PNG, or WebP).',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceName: z.string().describe("Contact resource, e.g. 'people/c123'"),
        photoBytes: z.string().describe('Base64-encoded photo bytes'),
        personFields: z.string().optional().describe("Response mask (default 'metadata')"),
    }),
    execute: async ({ googleContactsToken, resourceName, photoBytes, personFields }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/people/${resourceName}:updateContactPhoto`, {
                method: 'PATCH',
                query: { personFields },
                body: { photoBytes },
            });
            if (!result.ok) return { error: 'Failed to update contact photo', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error updating contact photo', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteContactPhoto = tool({
    description:
        'Removes a contact photo. Irreversible. Specify personFields to get the updated person back.',
    inputSchema: z.object({
        googleContactsToken: googleContactsTokenField,
        resourceName: z.string().describe("Contact resource, e.g. 'people/c123' (or 'people/me')"),
        personFields: z.string().optional().describe("Response mask, e.g. 'names' (default 'names')"),
        sources: z.array(z.string()).optional().describe('Source types to include'),
    }),
    execute: async ({ googleContactsToken, resourceName, personFields, sources }) => {
        try {
            const result = await peopleRequest(googleContactsToken, `/people/${resourceName}:deleteContactPhoto`, {
                method: 'DELETE',
                query: { personFields: personFields ?? 'names', sources },
            });
            if (!result.ok) return { error: 'Failed to delete contact photo', details: result.error };
            return { success: true, ...(result.data as Record<string, unknown>) };
        } catch (error) {
            return { error: 'Error deleting contact photo', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
