import { tool } from 'ai';
import { z } from 'zod';

export const getContacts = tool({
    description: 'Fetch Google contacts for the authenticated account using the People API.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        resourceName: z.string().optional().describe('Optional contact resource name to fetch, e.g. people/c123'),
        personFields: z.string().optional().default('names,emailAddresses,phoneNumbers,organizations').describe('Comma-separated person fields to return'),
        pageToken: z.string().optional().describe('Pagination token for connection lists'),
        includeOtherContacts: z.boolean().optional().default(false).describe('Whether to fetch Other Contacts instead of saved contacts'),
    }),
    execute: async ({ gmailToken, resourceName, personFields, pageToken, includeOtherContacts }) => {
        try {
            let url: URL;
            if (resourceName) {
                url = new URL(`https://people.googleapis.com/v1/${resourceName}`);
                url.searchParams.append('personFields', personFields);
            } else if (includeOtherContacts) {
                url = new URL('https://people.googleapis.com/v1/otherContacts');
                url.searchParams.append('readMask', personFields);
            } else {
                url = new URL('https://people.googleapis.com/v1/people/me/connections');
                url.searchParams.append('personFields', personFields);
            }

            if (pageToken && !resourceName) {
                url.searchParams.append('pageToken', pageToken);
            }

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get contacts', details: error };
            }

            const data = await response.json();
            return { success: true, ...data };
        } catch (error) {
            return {
                error: 'Error getting contacts',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
