// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { grafanaRequest } from './utils.js';

export const createOtlpV1Logs = tool({
    description:
        'Send OpenTelemetry Protocol (OTLP) v1 logs to Grafana Loki for ingestion and storage.',
    inputSchema: z.object({
        grafanaCredentials: z.string().describe('Grafana credentials JSON with baseUrl and optional apiToken'),
        resourceLogs: z
            .array(z.record(z.any()))
            .describe('List of resource logs to send to Grafana Loki in OTLP format'),
    }),
    execute: async ({ grafanaCredentials, resourceLogs }) => {
        try {
            const result = await grafanaRequest(grafanaCredentials, '/otlp/v1/logs', {
                method: 'POST',
                body: { resourceLogs },
                contentType: 'application/json',
            });

            if (!result.ok) {
                return {
                    error: 'Failed to create OTLP v1 logs',
                    details: result.data,
                    statusCode: result.status,
                };
            }

            return {
                success: true,
                statusCode: result.status,
                message: 'Logs ingested successfully',
            };
        } catch (error) {
            return {
                error: 'Error creating OTLP v1 logs',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
