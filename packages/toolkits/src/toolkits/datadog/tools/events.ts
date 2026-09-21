// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogCreateEvent = tool({
    description:
        'Post an event for deployments, outages, or config changes. Markdown is supported in text.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        title: z.string().max(100).describe('Event title'),
        text: z.string().describe('Event body (markdown supported)'),
        host: z.string().optional().describe('Associated host'),
        device_name: z.string().optional().describe('Associated device'),
        tags: z.array(z.string()).optional().describe('Event tags'),
        priority: z.enum(['normal', 'low']).optional().describe('Priority'),
        alert_type: z.enum(['error', 'warning', 'info', 'success']).optional().describe('Alert type'),
        source_type_name: z.string().optional().describe("Source, e.g. 'jenkins', 'docker'"),
        aggregation_key: z.string().optional().describe('Key for grouping events'),
        date_happened: z.number().optional().describe('Seconds epoch (defaults to now)'),
    }),
    execute: async ({ datadogCredentials, ...body }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', '/api/v1/events', { body });
        } catch (error) {
            return toDatadogError(error, 'Failed to create event');
        }
    },
});

export const datadogListEvents = tool({
    description:
        'List events in a seconds-epoch window. Start broad (few filters, narrow range) and narrow incrementally — combined filters on wide ranges can return empty or huge results.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        start: z.number().describe('Range start as seconds epoch'),
        end: z.number().describe('Range end as seconds epoch'),
        tags: z.array(z.string()).optional().describe('Tag filters'),
        sources: z.string().optional().describe('Comma-separated sources, e.g. jenkins,docker'),
        priority: z.enum(['normal', 'low']).optional().describe('Priority filter'),
        page: z.number().optional().describe('Page number'),
        unaggregated: z.boolean().optional().describe('Return unaggregated events'),
        exclude_aggregate: z.boolean().optional().describe('Exclude aggregated events'),
    }),
    execute: async ({ datadogCredentials, tags, ...rest }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/events', {
                query: { ...rest, tags: tags?.join(',') },
            });
            const events = (data as any)?.events ?? (Array.isArray(data) ? data : []);
            return { events, total_count: events.length, status: (data as any)?.status };
        } catch (error) {
            return toDatadogError(error, 'Failed to list events');
        }
    },
});
