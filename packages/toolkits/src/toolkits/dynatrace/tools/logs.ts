// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    dynatracePlatformRequest,
    dynatraceRequest,
    failedResult,
    sleep,
    toDynatraceError,
} from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID"). For DQL queries you may add "platformBaseUrl" (SaaS derives {env}.apps.dynatrace.com automatically).',
    );

export const exportLogs = tool({
    description:
        'Search/export log records with a Dynatrace log query, e.g. \'status="ERROR" and k8s.namespace="prod"\'. Requires logs.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        query: z.string().optional().describe('Log search query (Lucene-like), e.g. \'status="ERROR"\''),
        from: z.string().optional().describe('Start: relative ("now-1h") or ISO timestamp'),
        to: z.string().optional().describe('End: relative or ISO timestamp (default now)'),
        sort: z.string().optional().describe('Ordering, e.g. "timestamp asc" or "timestamp desc"'),
        pageSize: z.number().int().min(1).max(1000).optional().describe('Records per page (default 100)'),
    }),
    execute: async ({ dynatraceCredentials, query, from, to, sort, pageSize }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/logs/export', {
                query: { query, from, to, sort, pageSize },
            });
            if (!result.ok) return failedResult('Failed to export Dynatrace logs', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error exporting Dynatrace logs');
        }
    },
});

export const ingestLogs = tool({
    description:
        'Ingest log records into Dynatrace (OneAgent-less log intake). Requires logs.ingest scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        records: z
            .array(z.record(z.any()))
            .describe(
                'Log records, e.g. [{"content":"payment failed","log.source":"/var/log/app.log","severity":"ERROR","timestamp":"2024-01-01T00:00:00.000Z"}]',
            ),
    }),
    execute: async ({ dynatraceCredentials, records }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/logs/ingest', {
                method: 'POST',
                body: records.length === 1 ? records[0] : records,
            });
            if (!result.ok) return failedResult('Failed to ingest Dynatrace logs', result);
            return { success: true, ingestedRecords: records.length, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, 'Error ingesting Dynatrace logs');
        }
    },
});

export const queryGrail = tool({
    description:
        'Run a DQL (Dynatrace Query Language) query against Grail buckets — fetch logs, spans, events, metrics or business data, e.g. "fetch logs | filter status == \\"ERROR\\" | limit 100". Executes the query and polls until it completes. Requires storage read scopes such as storage:logs:read.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        query: z.string().describe('DQL query, e.g. \'fetch logs | filter status == "ERROR" | limit 100\''),
        fetchTimeoutSeconds: z
            .number()
            .int()
            .min(5)
            .max(300)
            .optional()
            .describe('Per-fetch timeout in seconds (default 60)'),
        maxWaitSeconds: z
            .number()
            .int()
            .min(5)
            .max(120)
            .optional()
            .describe('How long to poll for completion (default 60)'),
    }),
    execute: async ({ dynatraceCredentials, query, fetchTimeoutSeconds, maxWaitSeconds }) => {
        try {
            const started = await dynatracePlatformRequest(
                dynatraceCredentials,
                '/platform/storage/query/v1/query:execute',
                { method: 'POST', body: { query, fetchTimeoutSeconds: fetchTimeoutSeconds ?? 60 } },
            );
            if (!started.ok) return failedResult('Failed to start Grail query', started);
            const requestToken = started.data?.requestToken;
            if (!requestToken) {
                return { error: 'Failed to start Grail query', details: started.data };
            }

            const deadline = Date.now() + (maxWaitSeconds ?? 60) * 1000;
            for (;;) {
                const polled = await dynatracePlatformRequest(
                    dynatraceCredentials,
                    '/platform/storage/query/v1/query:poll',
                    { query: { 'request-token': requestToken } },
                );
                if (!polled.ok) return failedResult('Failed to poll Grail query', polled);
                const state = polled.data?.state;
                if (state !== 'RUNNING') return polled.data;
                if (Date.now() >= deadline) {
                    return {
                        state: 'RUNNING',
                        requestToken,
                        note: 'Query still running after maxWaitSeconds; poll again with the request token via query:poll.',
                    };
                }
                await sleep(2000);
            }
        } catch (error) {
            return toDynatraceError(error, 'Error running Grail query');
        }
    },
});
