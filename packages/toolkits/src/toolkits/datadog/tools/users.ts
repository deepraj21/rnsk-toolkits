// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogListUsers = tool({
    description:
        'List organization users with roles and access levels. Paginate with page_size/page_number.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        sort: z.string().optional().describe('Sort field: name, email, status, created_at'),
        sort_dir: z.string().optional().default('asc').describe('Sort direction'),
        page_size: z.number().min(1).max(1000).optional().default(50).describe('Users per page'),
        page_number: z.number().min(0).optional().default(0).describe('Page number'),
        filter_status: z.string().optional().describe('Status filter: Active, Pending, Disabled'),
    }),
    execute: async ({ datadogCredentials, sort, sort_dir = 'asc', page_size = 50, page_number = 0, filter_status }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v2/users', {
                query: {
                    sort,
                    sort_dir,
                    'page[size]': page_size,
                    'page[number]': page_number,
                    'filter[status]': filter_status,
                },
            });
            const users = (data as any)?.data ?? [];
            return {
                users,
                total_count: (data as any)?.meta?.page?.total_count ?? users.length,
                total_filtered_count: (data as any)?.meta?.page?.total_filtered_count,
            };
        } catch (error) {
            return toDatadogError(error, 'Failed to list users');
        }
    },
});

export const datadogListRoles = tool({
    description:
        'List organization roles (permission sets) with member counts. Filter by partial name match.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        sort: z.string().optional().describe('Sort field: name, created_at, user_count'),
        page_size: z.number().min(1).max(100).optional().default(10).describe('Roles per page'),
        page_number: z.number().min(0).optional().default(0).describe('Page number'),
        filter_name: z.string().optional().describe('Partial name filter'),
    }),
    execute: async ({ datadogCredentials, sort, page_size = 10, page_number = 0, filter_name }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v2/roles', {
                query: {
                    sort,
                    'page[size]': page_size,
                    'page[number]': page_number,
                    filter: filter_name,
                },
            });
            const roles = (data as any)?.data ?? [];
            return { roles, total_count: (data as any)?.meta?.page?.total_count ?? roles.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list roles');
        }
    },
});
