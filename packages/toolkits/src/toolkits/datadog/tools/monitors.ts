// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

const monitorType = z
    .enum(['metric alert', 'service check', 'event alert', 'query alert', 'composite', 'log alert'])
    .describe('Monitor type (query syntax must match the type)');

const monitorOptions = z.record(z.any()).optional().describe('Options: thresholds, notify_no_data, renotify_interval, etc.');

export const datadogCreateMonitor = tool({
    description:
        'Create a monitor with alerting thresholds and notifications. The query syntax must match the monitor type exactly or creation fails.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        type: monitorType,
        name: z.string().describe("Monitor name, e.g. 'High CPU Usage'"),
        query: z.string().describe("Monitor query, e.g. 'avg(last_5m):avg:system.cpu.user{*} > 80'"),
        message: z.string().optional().describe('Notification text (supports @mentions and markdown)'),
        tags: z.array(z.string()).optional().describe('Tags for the monitor'),
        priority: z.number().optional().describe('Priority 1-5 (1 is highest)'),
        options: monitorOptions,
    }),
    execute: async ({ datadogCredentials, ...body }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', '/api/v1/monitor', { body });
        } catch (error) {
            return toDatadogError(error, 'Failed to create monitor');
        }
    },
});

export const datadogGetMonitor = tool({
    description:
        'Get a monitor by ID with state, config, and optionally downtimes. Use datadogListMonitors to discover IDs.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        monitor_id: z.number().describe('Monitor ID'),
        group_states: z.array(z.string()).optional().describe("Group states: 'all', 'alert', 'warn', 'no data'"),
        with_downtimes: z.boolean().optional().describe('Include active downtimes'),
    }),
    execute: async ({ datadogCredentials, monitor_id, group_states, with_downtimes }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v1/monitor/${monitor_id}`, {
                query: { group_states: group_states?.join(','), with_downtimes },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to get monitor');
        }
    },
});

export const datadogListMonitors = tool({
    description:
        'List monitors with name/tag/state filters. Set page and page_size together to paginate (pages start at 0); omit both for all monitors.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        name: z.string().optional().describe('Name substring filter'),
        tags: z.array(z.string()).optional().describe('Scope tags, e.g. host:host0'),
        monitor_tags: z.array(z.string()).optional().describe('Service/custom tags, e.g. service:my-app'),
        group_states: z.array(z.string()).optional().describe('Alert, Warn, or No Data'),
        with_downtimes: z.boolean().optional().describe('Include current downtimes'),
        page: z.number().optional().describe('Page number from 0 (requires page_size)'),
        page_size: z.number().max(100).optional().describe('Monitors per page (max 100, requires page)'),
        id_offset: z.number().optional().describe('Monitor ID offset pagination'),
    }),
    execute: async ({ datadogCredentials, tags, monitor_tags, group_states, ...rest }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/monitor', {
                query: {
                    ...rest,
                    tags: tags?.join(','),
                    monitor_tags: monitor_tags?.join(','),
                    group_states: group_states?.join(','),
                },
            });
            const monitors = Array.isArray(data) ? data : (data?.monitors ?? []);
            return { monitors, total_count: data?.total_count ?? monitors.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list monitors');
        }
    },
});

export const datadogUpdateMonitor = tool({
    description:
        'Update a monitor; only provided fields change. Confirm query/type changes with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        monitor_id: z.number().describe('Monitor ID to update'),
        type: monitorType.optional(),
        name: z.string().optional().describe('Monitor name'),
        query: z.string().optional().describe('Monitor query'),
        message: z.string().optional().describe('Notification text'),
        tags: z.array(z.string()).optional().describe('Replacement tags'),
        priority: z.number().optional().describe('Priority 1-5'),
        options: monitorOptions,
    }),
    execute: async ({ datadogCredentials, monitor_id, ...body }) => {
        try {
            return await ddApi(datadogCredentials, 'PUT', `/api/v1/monitor/${monitor_id}`, { body });
        } catch (error) {
            return toDatadogError(error, 'Failed to update monitor');
        }
    },
});

export const datadogDeleteMonitor = tool({
    description:
        'Permanently delete a monitor. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        monitor_id: z.number().describe('Monitor ID to delete'),
        force: z.boolean().optional().describe('Force deletion without confirmation'),
    }),
    execute: async ({ datadogCredentials, monitor_id, force }) => {
        try {
            const data = await ddApi(datadogCredentials, 'DELETE', `/api/v1/monitor/${monitor_id}`, {
                query: { force },
            });
            return {
                deleted_monitor_id: (data as any)?.deleted_monitor_id ?? monitor_id,
                message: (data as any)?.message ?? 'Monitor deleted',
            };
        } catch (error) {
            return toDatadogError(error, 'Failed to delete monitor');
        }
    },
});

export const datadogMuteMonitor = tool({
    description:
        'Mute a monitor to silence alerts during maintenance or deployments. Without end it stays muted until manually unmuted.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        monitor_id: z.number().describe('Monitor ID to mute'),
        end: z.number().optional().describe('POSIX timestamp when the mute expires'),
        override: z.boolean().optional().describe('Override existing mute settings'),
    }),
    execute: async ({ datadogCredentials, monitor_id, end, override }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', `/api/v1/monitor/${monitor_id}/mute`, {
                body: { end, override },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to mute monitor');
        }
    },
});

export const datadogUnmuteMonitor = tool({
    description:
        'Unmute a monitor so alerting resumes immediately. Only unmute after maintenance or the issue is fully resolved to avoid alert storms.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        monitor_id: z.number().describe('Monitor ID to unmute'),
        all_scopes: z.boolean().optional().describe('Unmute for all scopes'),
    }),
    execute: async ({ datadogCredentials, monitor_id, all_scopes }) => {
        try {
            const data = await ddApi(datadogCredentials, 'POST', `/api/v1/monitor/${monitor_id}/unmute`, {
                body: { all_scopes },
            });
            return {
                monitor_id,
                muted: (data as any)?.muted ?? false,
                success: true,
                message: 'Monitor unmuted',
            };
        } catch (error) {
            return toDatadogError(error, 'Failed to unmute monitor');
        }
    },
});

export const datadogCreateDowntime = tool({
    description:
        'Create a downtime to suppress alerts during maintenance or deployments. Scope to hosts, services, tags, or a monitor ID.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        scope: z.array(z.string()).describe("Scope, e.g. ['host:web-01'] or ['*']"),
        message: z.string().optional().describe("Note, e.g. 'Scheduled maintenance'"),
        start: z.number().optional().describe('Start as seconds epoch (omit to start now)'),
        end: z.number().optional().describe('End as seconds epoch'),
        timezone: z.string().optional().describe("Timezone, e.g. 'UTC' or 'America/New_York'"),
        monitor_id: z.number().optional().describe('Downtime for one monitor instead of scope'),
        monitor_tags: z.array(z.string()).optional().describe('Monitor tags to match'),
        recurrence: z.record(z.any()).optional().describe('Recurrence: type (days/weeks/months/years), period, week_days, until_date/occurrences'),
    }),
    execute: async ({ datadogCredentials, ...body }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', '/api/v1/downtime', { body });
        } catch (error) {
            return toDatadogError(error, 'Failed to create downtime');
        }
    },
});
