// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogCreateSyntheticApiTest = tool({
    description:
        'Create a synthetic API test (http/ssl/tcp/dns/icmp) that monitors an endpoint from worldwide locations. Get location IDs from datadogGetSyntheticsLocations first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        name: z.string().min(1).max(200).describe('Test name'),
        config: z
            .object({
                request: z.record(z.any()).describe('HTTP request config'),
                assertions: z
                    .array(z.record(z.any()))
                    .describe("Assertions with type/operator/target, e.g. {type:'statusCode',operator:'is',target:200}"),
                variables: z.array(z.record(z.any())).optional().describe('Test variables'),
            })
            .describe('Request and assertions'),
        options: z
            .object({
                tick_every: z.number().min(60).max(604800).describe('Run frequency in seconds'),
                locations: z.array(z.string()).describe('Location IDs to run from'),
                device_ids: z.array(z.string()).optional().describe('Mobile device IDs'),
                min_location_failed: z.number().optional().describe('Failing locations required to alert'),
                min_failure_duration: z.number().optional().describe('Seconds failing before alerting'),
                monitor_options: z.record(z.any()).optional().describe('Monitor options'),
            })
            .describe('Execution options'),
        type: z.string().optional().describe("Test type (default 'api')"),
        subtype: z.enum(['http', 'ssl', 'tcp', 'dns', 'icmp']).optional().describe('Subtype (default http)'),
        status: z.enum(['live', 'paused']).optional().describe('Status (default live)'),
        message: z.string().optional().describe('Notification message'),
        tags: z.array(z.string()).optional().describe('Test tags'),
    }),
    execute: async ({ datadogCredentials, ...body }) => {
        try {
            const data = await ddApi(datadogCredentials, 'POST', '/api/v1/synthetics/tests/api', { body });
            return { ...(data as object), success: true };
        } catch (error) {
            return toDatadogError(error, 'Failed to create synthetic API test');
        }
    },
});

export const datadogListSynthetics = tool({
    description:
        'List synthetic tests with client-side tag/location filtering and limit/offset pagination.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        tags: z.string().optional().describe("Tag filter, e.g. 'env:prod,team:frontend'"),
        locations: z.string().optional().describe('Comma-separated location filter'),
        limit: z.number().min(1).max(200).optional().default(50).describe('Max tests (1-200)'),
        offset: z.number().min(0).optional().default(0).describe('Tests to skip'),
    }),
    execute: async ({ datadogCredentials, tags, locations, limit = 50, offset = 0 }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/synthetics/tests');
            let tests = (data as any)?.tests ?? (Array.isArray(data) ? data : []);
            if (tags) {
                const wanted = tags.split(',').map((t) => t.trim());
                tests = tests.filter((t: any) => wanted.every((w) => (t.tags ?? []).includes(w)));
            }
            if (locations) {
                const wanted = locations.split(',').map((l) => l.trim());
                tests = tests.filter((t: any) => (t.locations ?? []).some((l: string) => wanted.includes(l)));
            }
            return { tests: tests.slice(offset, offset + limit), total_count: tests.length };
        } catch (error) {
            return toDatadogError(error, 'Failed to list synthetics tests');
        }
    },
});

export const datadogGetSyntheticsLocations = tool({
    description:
        'List public and private synthetic locations. Use the IDs when creating synthetic tests.',
    inputSchema: z.object({
        datadogCredentials: credsField,
    }),
    execute: async ({ datadogCredentials }) => {
        try {
            const data = await ddApi(datadogCredentials, 'GET', '/api/v1/synthetics/locations');
            const locations = (data as any)?.locations ?? (Array.isArray(data) ? data : []);
            return { locations };
        } catch (error) {
            return toDatadogError(error, 'Failed to get synthetics locations');
        }
    },
});
