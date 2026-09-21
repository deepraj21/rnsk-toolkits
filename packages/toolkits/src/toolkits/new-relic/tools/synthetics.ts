// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, nerdgraph, newRelicApiKeyField, synthApi } from './client.js';

const MONITOR_PERIODS = ['EVERY_MINUTE', 'EVERY_5_MINUTES', 'EVERY_10_MINUTES', 'EVERY_15_MINUTES', 'EVERY_30_MINUTES', 'EVERY_HOUR', 'EVERY_6_HOURS', 'EVERY_12_HOURS', 'EVERY_DAY'] as const;

const monitorLocations = z.object({
    public: z.array(z.string()).optional().describe("Public locations, e.g. ['AWS_US_EAST_1','AWS_EU_WEST_1'] (at least one public or private required)"),
    private: z.array(z.string()).optional().describe('Private location GUIDs'),
}).describe('Where the monitor runs');

const SYNTH_ERRORS = 'errors { description type }';

// ---- REST API v3 monitors ----

const legacyFrequency = z.number().int().describe('Check frequency minutes: 1, 5, 10, 15, 30, 60, 360, 720, or 1440');

export const createMonitor = tool({
    description: 'Creates a legacy synthetic monitor (SIMPLE ping, BROWSER, SCRIPT_API, SCRIPT_BROWSER) via REST v3 for uptime checks.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        name: z.string().describe('Monitor name, descriptive and unique'),
        type: z.enum(['SIMPLE', 'BROWSER', 'SCRIPT_API', 'SCRIPT_BROWSER']),
        frequency: legacyFrequency,
        locations: z.array(z.string()).min(1).describe("Locations, e.g. ['AWS_US_EAST_1'] (list valid ones via listLocations)"),
        status: z.enum(['ENABLED', 'DISABLED']).describe('ENABLED runs immediately'),
        uri: z.string().optional().describe('URL to monitor (required for SIMPLE/BROWSER)'),
    }),
    execute: async ({ newRelicApiKey, ...monitor }) =>
        synthApi(newRelicApiKey, 'POST', '/monitors', { body: monitor }, 'create synthetic monitor'),
});

export const getSynthMonitor = tool({
    description: 'Reads one synthetic monitor (config, status, SLA threshold) by UUID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        monitorId: z.string().describe('Monitor UUID to retrieve'),
    }),
    execute: async ({ newRelicApiKey, monitorId }) =>
        synthApi(newRelicApiKey, 'GET', `/monitors/${monitorId}`, undefined, 'get synthetic monitor'),
});

export const listMonitors = tool({
    description: 'Lists synthetic monitors with limit/offset pagination (max 100 per page).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        limit: z.number().int().min(1).max(100).optional().describe('Results per page (default 50, max 100)'),
        offset: z.number().int().min(0).optional().describe('Monitors to skip (default 0)'),
    }),
    execute: async ({ newRelicApiKey, limit, offset }) =>
        synthApi(newRelicApiKey, 'GET', '/monitors', { query: { limit, offset } }, 'list synthetic monitors'),
});

export const patchMonitor = tool({
    description: 'Partially updates a synthetic monitor. Only provided fields change — use for small tweaks.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        monitorId: z.string().describe('Monitor UUID to update'),
        name: z.string().optional(),
        type: z.enum(['SIMPLE', 'BROWSER', 'SCRIPT_API', 'SCRIPT_BROWSER']).optional(),
        frequency: legacyFrequency.optional(),
        uri: z.string().optional().describe('Valid HTTP/HTTPS URL'),
        locations: z.array(z.string()).optional(),
        status: z.enum(['ENABLED', 'DISABLED']).optional(),
        slaThreshold: z.number().optional().describe('Acceptable response-time seconds'),
    }),
    execute: async ({ newRelicApiKey, monitorId, ...patch }) =>
        synthApi(newRelicApiKey, 'PATCH', `/monitors/${monitorId}`, { body: patch }, 'patch synthetic monitor'),
});

export const updateSynthMonitor = tool({
    description: 'Fully replaces a synthetic monitor via PUT. All fields required (name, type, frequency, uri, locations, status).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        monitorId: z.string().describe('Monitor UUID to replace'),
        name: z.string(),
        type: z.enum(['SIMPLE', 'BROWSER', 'SCRIPT_API', 'SCRIPT_BROWSER']).describe('Type cannot be changed on update'),
        frequency: legacyFrequency,
        uri: z.string().describe('Valid HTTP/HTTPS URL'),
        locations: z.array(z.string()).min(1),
        status: z.enum(['ENABLED', 'DISABLED']),
        slaThreshold: z.number().min(0).optional().describe('SLA threshold seconds'),
    }),
    execute: async ({ newRelicApiKey, monitorId, ...monitor }) =>
        synthApi(newRelicApiKey, 'PUT', `/monitors/${monitorId}`, { body: monitor }, 'update synthetic monitor'),
});

export const deleteMonitor = tool({
    description: 'Permanently deletes a synthetic monitor by UUID. Immediate and irreversible.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        monitorId: z.string().describe('Monitor UUID to delete'),
    }),
    execute: async ({ newRelicApiKey, monitorId }) =>
        synthApi(newRelicApiKey, 'DELETE', `/monitors/${monitorId}`, undefined, 'delete synthetic monitor'),
});

export const updateMonitorScript = tool({
    description: 'Updates the script of a SCRIPT_BROWSER/SCRIPT_API monitor. Sends base64-encoded JavaScript (Selenium for browser, http-request for API).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        monitorId: z.string().describe('SCRIPT_BROWSER or SCRIPT_API monitor UUID'),
        scriptText: z.string().describe('Base64-encoded script content'),
    }),
    execute: async ({ newRelicApiKey, monitorId, scriptText }) =>
        synthApi(newRelicApiKey, 'PUT', `/monitors/${monitorId}/script`, { body: { scriptText } }, 'update monitor script'),
});

export const listLocations = tool({
    description: 'Lists valid public and private locations for synthetic monitors. Run before creating monitors to pick location codes.',
    inputSchema: z.object({ newRelicApiKey: newRelicApiKeyField }),
    execute: async ({ newRelicApiKey }) =>
        synthApi(newRelicApiKey, 'GET', '/locations', undefined, 'list synthetic monitor locations'),
});

// ---- NerdGraph synthetics ----

const runtimeInput = z.object({
    runtimeType: z.string().describe("Runtime, e.g. 'NODE_API', 'CHROME_BROWSER'"),
    runtimeTypeVersion: z.string().describe("Version, e.g. '16.10' (Node) or '100' (Chrome)"),
    scriptLanguage: z.string().optional().describe("Default 'JAVASCRIPT'"),
});

export const createSyntheticsSimpleMonitor = tool({
    description: 'Creates a ping (SIMPLE) monitor via NerdGraph checking URL availability from multiple locations with TLS/response validation options.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the monitor'),
        name: z.string().describe('Monitor name'),
        uri: z.string().describe('Valid HTTP/HTTPS URL to monitor'),
        locations: z.object({ public: z.array(z.string()).min(1).describe("Location codes, e.g. ['AWS_US_EAST_1']") }).describe('Run locations'),
        period: z.enum(MONITOR_PERIODS),
        status: z.enum(['ENABLED', 'DISABLED']).describe('ENABLED starts monitoring immediately'),
        advancedOptions: z.object({
            customHeaders: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
            useTlsValidation: z.boolean().optional(),
            responseValidationText: z.string().optional().describe('Required body text — monitor fails without it'),
        }).optional(),
    }),
    execute: async ({ newRelicApiKey, accountId, ...monitor }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $monitor: SyntheticsCreateSimpleMonitorInput!) { syntheticsCreateSimpleMonitor(accountId: $accountId, monitor: $monitor) { monitor { id name uri } ${SYNTH_ERRORS} } }`,
            { accountId, monitor },
            'create synthetics simple monitor',
        ),
});

export const updateSyntheticsSimpleMonitor = tool({
    description: 'Updates a ping monitor (name, status, period, URI, locations, apdex, TLS/redirect/validation options). Only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Monitor entity GUID to update'),
        monitor: z.object({
            name: z.string().optional(),
            uri: z.string().optional().describe('Valid HTTP/HTTPS URL'),
            period: z.enum(MONITOR_PERIODS).optional(),
            status: z.enum(['ENABLED', 'DISABLED']).optional(),
            locations: z.array(z.string()).optional().describe('Location codes (omit to keep)'),
            apdexTarget: z.number().min(0).optional().describe('Acceptable response-time seconds'),
            advancedOptions: z.object({
                customHeaders: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
                useTlsValidation: z.boolean().optional(),
                redirectIsFailure: z.boolean().optional().describe('Treat 3xx as failure'),
                responseValidationText: z.string().optional(),
                shouldBypassHeadRequest: z.boolean().optional().describe('Skip HEAD, go straight to GET'),
            }).optional(),
        }).describe('Fields to update'),
    }),
    execute: async ({ newRelicApiKey, guid, monitor }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $monitor: SyntheticsUpdateSimpleMonitorInput!) { syntheticsUpdateSimpleMonitor(guid: $guid, monitor: $monitor) { ${SYNTH_ERRORS} } }`,
            { guid, monitor },
            'update synthetics simple monitor',
        ),
});

export const createScriptedMonitor = tool({
    description: 'Creates a scripted monitor via NerdGraph: SCRIPT_BROWSER (Selenium user flows) or SCRIPT_API (endpoint checks). Runtime must match the type.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the monitor'),
        monitorType: z.enum(['SCRIPT_BROWSER', 'SCRIPT_API']),
        name: z.string().describe('Monitor name, unique within the account'),
        script: z.string().describe('JavaScript: Selenium ($browser) for browser, $http for API — include assertions'),
        locations: monitorLocations,
        period: z.enum(MONITOR_PERIODS).describe('Check frequency (frequent checks consume quota)'),
        runtime: runtimeInput.describe('CHROME_BROWSER for SCRIPT_BROWSER, NODE_API for SCRIPT_API'),
        status: z.enum(['ENABLED', 'DISABLED', 'MUTED']).optional().describe('Initial status (default ENABLED)'),
        advancedOptions: z.record(z.any()).optional().describe('Custom headers, device emulation, validation rules'),
    }),
    execute: async ({ newRelicApiKey, accountId, monitorType, ...monitor }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $monitor: SyntheticsCreateScriptedMonitorInput!) { syntheticsCreateScriptedMonitor(accountId: $accountId, monitorType: ${monitorType}, monitor: $monitor) { monitor { id name } ${SYNTH_ERRORS} } }`,
            { accountId, monitor: { status: 'ENABLED', ...monitor } },
            'create scripted monitor',
        ),
});

export const updateScriptedMonitor = tool({
    description: 'Updates a scripted monitor (name, period, script, locations, status, apdex). Only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Monitor entity GUID to update'),
        monitorType: z.enum(['SCRIPT_BROWSER', 'SCRIPT_API']).describe('Determines which mutation runs'),
        monitor: z.object({
            name: z.string().optional(),
            script: z.string().optional().describe('Updated script content'),
            period: z.enum(MONITOR_PERIODS).optional(),
            status: z.enum(['ENABLED', 'DISABLED', 'MUTED']).optional(),
            locations: z.object({
                public: z.array(z.string()).optional(),
                private: z.array(z.string()).optional(),
            }).optional(),
            apdexTarget: z.number().optional().describe('SLA seconds (default 7.0)'),
        }).describe('Fields to update'),
    }),
    execute: async ({ newRelicApiKey, guid, monitorType, monitor }) => {
        const mutation = monitorType === 'SCRIPT_BROWSER' ? 'syntheticsUpdateScriptBrowserMonitor' : 'syntheticsUpdateScriptApiMonitor';
        return nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $monitor: SyntheticsUpdateScriptedMonitorInput!) { ${mutation}(guid: $guid, monitor: $monitor) { monitor { guid name } ${SYNTH_ERRORS} } }`,
            { guid, monitor },
            'update scripted monitor',
        );
    },
});

export const createBrokenLinksMonitor = tool({
    description: 'Creates a broken-links monitor scanning a webpage for dead links on a schedule. Needs NODE_API runtime and at least one location.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the monitor'),
        name: z.string().describe('Monitor name'),
        uri: z.string().describe('Valid HTTP/HTTPS page URL to scan'),
        period: z.enum(MONITOR_PERIODS),
        status: z.enum(['ENABLED', 'DISABLED']).describe('ENABLED runs immediately'),
        runtime: z.object({
            runtimeType: z.string().describe("e.g. 'NODE_API'"),
            runtimeTypeVersion: z.string().describe("e.g. '16.10'"),
        }).describe('Execution environment'),
        locations: monitorLocations,
        tags: z.array(z.object({ key: z.string(), values: z.array(z.string()) })).optional().describe('Organizational tags'),
    }),
    execute: async ({ newRelicApiKey, accountId, ...monitor }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $monitor: SyntheticsCreateBrokenLinksMonitorInput!) { syntheticsCreateBrokenLinksMonitor(accountId: $accountId, monitor: $monitor) { ${SYNTH_ERRORS} } }`,
            { accountId, monitor },
            'create broken links monitor',
        ),
});

export const createSyntheticsPrivateLocation = tool({
    description: 'Creates a private location for running monitors inside your own infrastructure. Returns a GUID for monitor targeting.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the location'),
        name: z.string().describe('Location name'),
        description: z.string().optional(),
        verifiedScriptExecution: z.boolean().optional().describe('Require password to edit (default false)'),
    }),
    execute: async ({ newRelicApiKey, accountId, ...input }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $privateLocation: SyntheticsPrivateLocationInput!) { syntheticsCreatePrivateLocation(accountId: $accountId, privateLocation: $privateLocation) { guid ${SYNTH_ERRORS} } }`,
            { accountId, privateLocation: input },
            'create synthetics private location',
        ),
});

export const deleteSyntheticsPrivateLocation = tool({
    description: 'Permanently deletes a private location by GUID. Monitors targeting it stop running there.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Private location entity GUID to delete'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!) { syntheticsDeletePrivateLocation(guid: $guid) { ${SYNTH_ERRORS} } }`,
            { guid },
            'delete synthetics private location',
        ),
});

export const deleteSyntheticsMonitorGraphql = tool({
    description: 'Deletes a synthetic monitor by entity GUID via NerdGraph. Immediate and irreversible.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Monitor entity GUID to delete'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($guid: EntityGuid!) { syntheticsDeleteMonitor(guid: $guid) { deletedGuid } }',
            { guid },
            'delete synthetics monitor',
        ),
});

export const createSyntheticsSecureCredential = tool({
    description: 'Stores an encrypted credential (API keys, passwords, tokens) via NerdGraph for use in monitor scripts. Key: 1-64 uppercase chars.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the credential'),
        key: z.string().min(1).max(64).describe('UPPERCASE key name (letters, numbers, underscores)'),
        value: z.string().min(1).describe('Secret value (encrypted at rest)'),
        description: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, accountId, key, value, description }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $key: String!, $value: SecureValue!, $description: String) { syntheticsCreateSecureCredential(accountId: $accountId, key: $key, value: $value, description: $description) { ${SYNTH_ERRORS} } }`,
            { accountId, key, value, description: description ?? null },
            'create synthetics secure credential',
        ),
});

export const deleteSyntheticsSecureCredential = tool({
    description: 'Permanently deletes a synthetics secure credential by account and key.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID owning the credential'),
        key: z.string().min(1).max(64).describe('Credential key name to delete'),
    }),
    execute: async ({ newRelicApiKey, accountId, key }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $key: String!) { syntheticsDeleteSecureCredential(accountId: $accountId, key: $key) { ${SYNTH_ERRORS} } }`,
            { accountId, key },
            'delete synthetics secure credential',
        ),
});
