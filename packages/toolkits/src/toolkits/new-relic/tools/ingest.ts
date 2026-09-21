// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { EVENTS_API_BASE, TRACE_API_BASE } from './client.js';

export const sendEvents = tool({
    description:
        'Sends custom events (business metrics, app events) for NRQL querying/charting. Each event needs eventType. Uses an Insights insert key (not the user key).',
    inputSchema: z.object({
        accountId: z.string().describe('Account ID receiving the events'),
        insertKey: z.string().describe('Insights insert API key (X-Insert-Key) — differs from the user API key'),
        events: z.array(z.record(z.any())).min(1).describe("Events with eventType + attributes, e.g. [{eventType:'Purchase',amount:99.99,userId:'user123'}]"),
    }),
    execute: async ({ accountId, insertKey, events }) => {
        try {
            if (!insertKey) return { error: 'New Relic insert key is required. Provide insertKey.' };
            const response = await fetch(`${EVENTS_API_BASE}/accounts/${accountId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Insert-Key': insertKey },
                body: JSON.stringify(events),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) return { error: 'Failed to send events', details: data };
            return data;
        } catch (error) {
            return { error: 'Error sending events', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

const spanSchema = z.object({
    id: z.string().describe('Unique span ID'),
    'trace.id': z.string().describe('Trace ID shared by all spans in the trace'),
    timestamp: z.number().int().optional().describe('Start epoch millis (default receipt time)'),
    attributes: z.object({
        'duration.ms': z.number().describe('Span duration millis (required)'),
        name: z.string().optional().describe("Span name, e.g. '/api/users'"),
        'parent.id': z.string().nullable().optional().describe('Caller span ID (null for root — traces need a root)'),
        'service.name': z.string().optional().describe('Owning entity, e.g. order-service'),
    }).catchall(z.any()).describe('Span details (duration.ms required)'),
});

export const sendTraces = tool({
    description:
        'Sends distributed-trace spans (New Relic format, max 1MB post-compression) for latency debugging. Uses a license/ingest key (not the user key).',
    inputSchema: z.object({
        ingestKey: z.string().describe('License (ingest) key for the Trace API — differs from the user API key'),
        traces: z.array(z.object({
            spans: z.array(spanSchema).min(1).describe('Units of work (at least one span)'),
            common: z.object({
                'service.name': z.string().optional().describe('Default service for all spans'),
                host: z.string().optional().describe('Default host for all spans'),
            }).catchall(z.any()).optional().describe('Shared attributes (span values override)'),
        })).min(1).describe('Traces to report'),
        dataFormat: z.enum(['newrelic']).optional().describe("Format (default 'newrelic')"),
        dataFormatVersion: z.string().optional().describe("Version (default '1')"),
    }),
    execute: async ({ ingestKey, traces, dataFormat, dataFormatVersion }) => {
        try {
            if (!ingestKey) return { error: 'New Relic ingest key is required. Provide ingestKey.' };
            const response = await fetch(TRACE_API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': ingestKey,
                    'Data-Format': dataFormat ?? 'newrelic',
                    'Data-Format-Version': dataFormatVersion ?? '1',
                },
                body: JSON.stringify(traces),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) return { error: 'Failed to send traces', details: data };
            return data;
        } catch (error) {
            return { error: 'Error sending traces', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
