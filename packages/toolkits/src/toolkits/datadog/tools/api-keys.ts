// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogListApiKeys = tool({
    description:
        'List API key metadata (names, owners, last-used) for auditing and rotation planning. Handle output securely — restrict to authorized personnel.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        sort: z.enum(['created_at', 'last4', 'modified_at', 'name']).optional().describe('Sort field'),
        page_size: z.number().min(1).max(1000).optional().describe('Keys per page (default 20, max 1000)'),
        page_number: z.number().min(0).optional().describe('Page number (0-indexed)'),
        filter_created_at_start: z.string().optional().describe('ISO: keys created after this time'),
        filter_created_at_end: z.string().optional().describe('ISO: keys created before this time'),
        filter_modified_at_start: z.string().optional().describe('ISO: keys modified after this time'),
        filter_modified_at_end: z.string().optional().describe('ISO: keys modified before this time'),
    }),
    execute: async ({ datadogCredentials, page_size, page_number, sort, ...filters }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v2/api_keys', {
                query: {
                    sort,
                    'page[size]': page_size,
                    'page[number]': page_number,
                    'filter[created_at][start]': filters.filter_created_at_start,
                    'filter[created_at][end]': filters.filter_created_at_end,
                    'filter[modified_at][start]': filters.filter_modified_at_start,
                    'filter[modified_at][end]': filters.filter_modified_at_end,
                },
            });
            return {
                data: (data as any)?.data ?? [],
                meta: (data as any)?.meta,
                total_count: (data as any)?.meta?.page?.total_count ?? (data as any)?.data?.length ?? 0,
            };
        } catch (error) {
            return toDatadogError(error, 'Failed to list API keys');
        }
    },
});
