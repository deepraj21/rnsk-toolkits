// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID").',
    );

export const listEvents = tool({
    description:
        'List Dynatrace events (deployments, configuration changes, availability events) in a timeframe. Filter with eventSelector (e.g. \'eventType("CUSTOM_DEPLOYMENT")\') or entitySelector. Requires events.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        eventSelector: z
            .string()
            .optional()
            .describe('Event scope, e.g. \'eventType("CUSTOM_DEPLOYMENT")\', \'status("OPEN")\''),
        entitySelector: z.string().optional().describe('Entity scope, e.g. \'type("SERVICE")\''),
        from: z.string().optional().describe('Start: relative ("now-2h") or ISO timestamp'),
        to: z.string().optional().describe('End: relative or ISO timestamp (default now)'),
        pageSize: z.number().int().min(1).max(1000).optional().describe('Results per page (default 100)'),
    }),
    execute: async ({ dynatraceCredentials, eventSelector, entitySelector, from, to, pageSize }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/events', {
                query: { eventSelector, entitySelector, from, to, pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace events', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace events');
        }
    },
});

export const getEvent = tool({
    description: 'Get a single Dynatrace event by ID. Requires events.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        eventId: z.string().describe('Event ID, e.g. "-1234567890123456789_1234567890123"'),
    }),
    execute: async ({ dynatraceCredentials, eventId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/events/${encodeURIComponent(eventId)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Dynatrace event "${eventId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace event "${eventId}"`);
        }
    },
});

export const listEventTypes = tool({
    description: 'List Dynatrace event types (CUSTOM_DEPLOYMENT, CUSTOM_INFO, MARKED_FOR_TERMINATION, ...). Requires events.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        pageSize: z.number().int().min(1).max(1000).optional().describe('Results per page (default 100)'),
    }),
    execute: async ({ dynatraceCredentials, pageSize }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/eventTypes', {
                query: { pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace event types', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace event types');
        }
    },
});

export const ingestEvent = tool({
    description:
        'Push a custom event to Dynatrace (deployment markers, info, annotations). Use CUSTOM_DEPLOYMENT with an entitySelector to mark releases on services/hosts. Requires events.ingest scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        eventType: z
            .string()
            .describe('Event type, e.g. "CUSTOM_DEPLOYMENT", "CUSTOM_INFO", "CUSTOM_ANNOTATION"'),
        title: z.string().describe('Event title, e.g. "Deployed webshop v2.4.1"'),
        entitySelector: z
            .string()
            .optional()
            .describe('Entities to attach to, e.g. \'type("SERVICE"),tag("app:webshop")\''),
        startTime: z.string().optional().describe('Start: epoch-ms, ISO timestamp, or relative ("now-5m")'),
        endTime: z.string().optional().describe('End: epoch-ms, ISO timestamp, or relative'),
        timeout: z.number().int().optional().describe('Timeout in minutes (default 15)'),
        properties: z
            .record(z.string())
            .optional()
            .describe('Custom properties, e.g. {"version":"2.4.1","ci_job":"deploy-prod"}'),
    }),
    execute: async ({ dynatraceCredentials, eventType, title, entitySelector, startTime, endTime, timeout, properties }) => {
        try {
            const query: Record<string, string | number | boolean | undefined> = {
                eventType,
                title,
                entitySelector,
                startTime,
                endTime,
                timeout,
            };
            const repeatQuery: Record<string, Array<string | number>> = {};
            if (properties) {
                repeatQuery.properties = Object.entries(properties).map(([k, v]) => `${k}:${v}`);
            }
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/events/ingest', {
                method: 'POST',
                query,
                repeatQuery: Object.keys(repeatQuery).length ? repeatQuery : undefined,
            });
            if (!result.ok) return failedResult('Failed to ingest Dynatrace event', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error ingesting Dynatrace event');
        }
    },
});
