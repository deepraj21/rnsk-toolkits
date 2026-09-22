import { tool } from 'ai';
import { z } from 'zod';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

async function peopleFetch(token: string | undefined, path: string, params: Record<string, string | undefined>, label: string) {
    try {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) if (v) qs.append(k, v);
        const url = `https://people.googleapis.com/v1/${path}${qs.toString() ? `?${qs.toString()}` : ''}`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return { error: `Failed to ${label}`, details: error };
        }
        return await response.json();
    } catch (error) {
        return {
            error: `Error in ${label}`,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

const personFieldsField = z.string().optional().describe("Comma-separated mask, e.g. 'names,emailAddresses' (other-contacts mode allows only emailAddresses, names, phoneNumbers, metadata)");

export const getPeople = tool({
    description: "Get one person by resource name, or list 'Other Contacts' with pagination/sync tokens. Other-contacts mode restricts person_fields.",
    inputSchema: z.object({
        gmailToken: tokenField,
        resourceName: z.string().optional().describe("Person resource, e.g. 'people/me' or 'people/c123...' (ignored when otherContacts is true)"),
        personFields: personFieldsField,
        otherContacts: z.boolean().optional().describe("True: list Other Contacts (enables pageSize/pageToken/syncToken, ignores resourceName)"),
        pageSize: z.number().int().min(1).max(1000).optional().describe('Other-contacts page size (default 10)'),
        pageToken: z.string().optional().describe('Other-contacts next page token'),
        syncToken: z.string().optional().describe('Other-contacts incremental sync token (empty = full sync)'),
        sources: z.array(z.enum(['READ_SOURCE_TYPE_CONTACT', 'READ_SOURCE_TYPE_PROFILE'])).optional().describe('Other-contacts sources (PROFILE needs CONTACT too)'),
    }),
    execute: async ({ gmailToken, resourceName, personFields, otherContacts, pageSize, pageToken, syncToken, sources }) => {
        if (otherContacts) {
            return peopleFetch(gmailToken, 'otherContacts', {
                readMask: personFields,
                pageSize: pageSize ? String(pageSize) : undefined,
                pageToken,
                syncToken,
                ...(sources ? { sources: sources.join(',') } : {}),
            }, 'list other contacts');
        }
        return peopleFetch(gmailToken, resourceName || 'people/me', { personFields }, 'get person');
    },
});

export const searchPeople = tool({
    description: "Search saved contacts (+ Other Contacts optionally) by name/email/phone/org. Never auto-pick from ambiguous results; dedupe by email across pages.",
    inputSchema: z.object({
        gmailToken: tokenField,
        query: z.string().describe('Query matching names, nicknames, emails, phones, organizations'),
        personFields: z.string().optional().describe("Mask, e.g. 'names,emailAddresses'. Results touching 'Other Contacts' only support emailAddresses, metadata, names, phoneNumbers — avoid organizations/birthdays or they may be silently omitted."),
        pageSize: z.number().int().min(0).max(30).optional().describe('Results per page (default 10, API caps at 30)'),
        pageToken: z.string().optional().describe('next_page_token from previous page'),
    }),
    execute: async ({ gmailToken, query, personFields, pageSize, pageToken }) =>
        peopleFetch(gmailToken, 'people:searchContacts', {
            query,
            readMask: personFields,
            pageSize: pageSize ? String(pageSize) : undefined,
            pageToken,
        }, 'search people'),
});
