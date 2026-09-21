// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogListIncidents = tool({
    description:
        'List incidents with state/severity/timeline data. Filter active incidents with filter_query state:active.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        filter_query: z.string().optional().describe("Filter, e.g. 'state:active'"),
        sort: z.enum(['public_id', '-public_id']).optional().describe('Sort by public ID'),
        include: z.string().optional().describe("Related resources, e.g. 'users,attachments'"),
        page_size: z.number().min(1).max(100).optional().default(25).describe('Incidents per page'),
        page_offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
    }),
    execute: async ({ datadogCredentials, filter_query, page_size = 25, page_offset = 0, ...rest }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v2/incidents', {
                query: {
                    ...rest,
                    'filter[query]': filter_query,
                    'page[size]': page_size,
                    'page[offset]': page_offset,
                },
            });
            const incidents = (data as any)?.data ?? [];
            return { incidents, total_count: (data as any)?.meta?.page?.total_count ?? incidents.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list incidents');
        }
    },
});
