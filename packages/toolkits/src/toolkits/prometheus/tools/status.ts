// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { promRequest, toPromError } from './client.js';

const credsField = z.string().describe('Prometheus credentials JSON with baseUrl and optional username/password or bearerToken');

export const statusConfig = tool({
    description: 'Returns the loaded Prometheus configuration as dumped YAML (comments not included).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/config');
        } catch (error) {
            return toPromError(error, 'Failed to get status config');
        }
    },
});

export const statusFlags = tool({
    description: 'Returns flag values the server was started with (all values are strings).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/flags');
        } catch (error) {
            return toPromError(error, 'Failed to get status flags');
        }
    },
});

export const statusRuntimeInfo = tool({
    description: 'Returns runtime info (start time, uptime data, goroutines, series count, retention). Fields may change between versions.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/runtimeinfo');
        } catch (error) {
            return toPromError(error, 'Failed to get runtime info');
        }
    },
});

export const statusBuildInfo = tool({
    description: 'Returns build info (version, revision, branch, build date, Go version).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/buildinfo');
        } catch (error) {
            return toPromError(error, 'Failed to get build info');
        }
    },
});

export const statusTsdb = tool({
    description: 'Returns TSDB cardinality stats (series count, per-metric/label breakdowns, memory use).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        limit: z.number().int().min(1).max(10000).optional().describe('Items per stat set (default 10, max 10000)'),
    }),
    execute: async ({ prometheusCredentials, limit }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/tsdb', { query: { limit } });
        } catch (error) {
            return toPromError(error, 'Failed to get TSDB stats');
        }
    },
});

export const statusTsdbBlocks = tool({
    description: 'Lists loaded TSDB blocks with ULIDs, time ranges, and compaction info. Experimental; format may change.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/tsdb/blocks');
        } catch (error) {
            return toPromError(error, 'Failed to get TSDB blocks');
        }
    },
});

export const statusWalReplay = tool({
    description: 'Returns WAL replay progress (segments read/total, percent, state). Available before the server is marked ready.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/walreplay');
        } catch (error) {
            return toPromError(error, 'Failed to get WAL replay stats');
        }
    },
});

export const statusSelfMetrics = tool({
    description: 'Returns Prometheus internal metrics as structured JSON (same data as /metrics exposition). Experimental.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/status/self_metrics');
        } catch (error) {
            return toPromError(error, 'Failed to get self metrics');
        }
    },
});

export const healthy = tool({
    description: 'Health check: returns 200 when the server is healthy (no /api/v1 prefix). Use for liveness probes.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/-/healthy');
        } catch (error) {
            return toPromError(error, 'Health check failed');
        }
    },
});

export const ready = tool({
    description: 'Readiness check: returns 200 when the server is ready to serve traffic (no /api/v1 prefix).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/-/ready');
        } catch (error) {
            return toPromError(error, 'Readiness check failed');
        }
    },
});

export const federate = tool({
    description: 'Federation endpoint: returns selected series in exposition format for hierarchical federation. Requires at least one match[] selector.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        match: z.array(z.string()).min(1).describe('Series selectors to federate (at least one required)'),
    }),
    execute: async ({ prometheusCredentials, match }) => {
        try {
            return await promRequest(prometheusCredentials, '/federate', {
                query: { 'match[]': match },
            });
        } catch (error) {
            return toPromError(error, 'Failed to federate');
        }
    },
});

export const listNotifications = tool({
    description: 'Lists current UI notifications (active alerts about the server itself, e.g. config issues).',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/notifications');
        } catch (error) {
            return toPromError(error, 'Failed to list notifications');
        }
    },
});

export const liveNotifications = tool({
    description: 'Collects live UI notifications over Server-Sent Events for a bounded time. Active notifications arrive on connect; deletions arrive with active:false. The stream is time-boxed since SSE never ends on its own.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        durationSeconds: z.number().min(1).max(120).optional().describe('How long to listen (1-120s, default 10)'),
    }),
    execute: async ({ prometheusCredentials, durationSeconds }) => {
        const { parsePrometheusCredentials } = await import('./client.js');
        let baseUrl: string;
        let headers: Record<string, string>;
        try {
            const creds = parsePrometheusCredentials(prometheusCredentials);
            baseUrl = creds.baseUrl;
            headers = { Accept: 'text/event-stream' };
            if (creds.bearerToken) headers.Authorization = `Bearer ${creds.bearerToken}`;
            else if (creds.username) {
                headers.Authorization = `Basic ${Buffer.from(`${creds.username}:${creds.password ?? ''}`).toString('base64')}`;
            }
        } catch (error) {
            return toPromError(error, 'Failed to stream notifications');
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), (durationSeconds ?? 10) * 1000);
        const events: unknown[] = [];
        try {
            const response = await fetch(`${baseUrl}/api/v1/notifications/live`, {
                headers,
                signal: controller.signal,
            });
            if (!response.ok || !response.body) {
                return { error: 'Failed to stream notifications', status: response.status };
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';
                for (const part of parts) {
                    const dataLines = part.split('\n').filter((l) => l.startsWith('data:'));
                    for (const line of dataLines) {
                        const payload = line.slice(5).trim();
                        try {
                            events.push(JSON.parse(payload));
                        } catch {
                            events.push({ raw: payload });
                        }
                    }
                }
            }
            return { events };
        } catch (error) {
            if ((error as any)?.name === 'AbortError') {
                return { events, truncated: true };
            }
            return toPromError(error, 'Failed to stream notifications');
        } finally {
            clearTimeout(timer);
        }
    },
});
