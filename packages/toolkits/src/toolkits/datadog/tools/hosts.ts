// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogListHosts = tool({
    description:
        'List infrastructure hosts with metrics, tags, and status. Filter by tag query and sort by status, name, cpu, iowait, or load.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        filter: z.string().optional().describe("Tag filter, e.g. 'env:production'"),
        sort_field: z.enum(['status', 'name', 'cpu', 'iowait', 'load']).optional().describe('Sort field'),
        sort_dir: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        start: z.number().optional().describe('Pagination offset'),
        count: z.number().max(1000).optional().describe('Hosts to return (max 1000)'),
        from_timestamp: z.number().optional().describe('Activity window start as seconds epoch'),
        include_hosts_metadata: z.boolean().optional().describe('Include host metadata'),
        include_muted_hosts_data: z.boolean().optional().describe('Include muted hosts'),
    }),
    execute: async ({ datadogCredentials, ...query }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', '/api/v1/hosts', { query });
        } catch (error) {
            return toDatadogError(error, 'Failed to list hosts');
        }
    },
});

export const datadogGetHostTags = tool({
    description:
        'Get all tags for a host, optionally filtered by source (users, chef, puppet, aws, datadog).',
    inputSchema: z.object({
        datadogCredentials: credsField,
        host_name: z.string().describe('Host name'),
        source: z.string().optional().describe('Tag source to filter by'),
    }),
    execute: async ({ datadogCredentials, host_name, source }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v1/tags/hosts/${encodeURIComponent(host_name)}`, {
                query: { source },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to get host tags');
        }
    },
});

export const datadogListAllTags = tool({
    description:
        'List all tags in use across the organization, optionally filtered by source. Use to discover tag keys for filters.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        source: z.string().optional().describe("Source filter, e.g. 'chef', 'users', 'datadog'"),
    }),
    execute: async ({ datadogCredentials, source }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/tags/hosts', {
                query: { source },
            });
            const tagMap = (data as any)?.tags ?? {};
            const tags = Object.entries(tagMap).map(([name, hosts]) => ({
                name,
                count: Array.isArray(hosts) ? hosts.length : 0,
            }));
            return { tags, total_count: tags.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list tags');
        }
    },
});

export const datadogUpdateHostTags = tool({
    description:
        'Replace all tags from one source on a host (defaults to users source). This overwrites — include the full desired tag set.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        host_name: z.string().describe('Host name'),
        tags: z.array(z.string()).describe('Complete replacement tag list'),
        source: z.string().optional().describe("Tag source (defaults to 'users')"),
    }),
    execute: async ({ datadogCredentials, host_name, tags, source }) => {
        try {
            const data = await ddApi(
                datadogCredentials,
                'PUT',
                `/api/v1/tags/hosts/${encodeURIComponent(host_name)}`,
                { query: { source }, body: { tags } },
            );
            return { host: host_name, tags: (data as any)?.tags ?? tags, source };
        } catch (error) {
            return toDatadogError(error, 'Failed to update host tags');
        }
    },
});
