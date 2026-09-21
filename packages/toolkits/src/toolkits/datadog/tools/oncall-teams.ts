// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogGetTeamOnCallUsers = tool({
    description:
        'Get the current on-call users for an On-Call team. Use during incidents to find responders.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        team_id: z.string().describe('On-Call team ID'),
    }),
    execute: async ({ datadogCredentials, team_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v2/on-call/teams/${team_id}/on-call`);
        } catch (error) {
            return toDatadogError(error, 'Failed to get team on-call users');
        }
    },
});

export const datadogGetTeamRoutingRules = tool({
    description:
        'Get the On-Call routing rules configured for a team.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        team_id: z.string().describe('On-Call team ID'),
    }),
    execute: async ({ datadogCredentials, team_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v2/on-call/teams/${team_id}/routing-rules`);
        } catch (error) {
            return toDatadogError(error, 'Failed to get team routing rules');
        }
    },
});

export const datadogSetTeamRoutingRules = tool({
    description:
        'Replace the On-Call routing rules for a team. This overwrites all existing rules — confirm with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        team_id: z.string().describe('On-Call team ID'),
        data: z.record(z.any()).describe("JSON:API data object with type 'team_routing_rules' and rule attributes"),
    }),
    execute: async ({ datadogCredentials, team_id, data }) => {
        try {
            return await ddApi(datadogCredentials, 'PUT', `/api/v2/on-call/teams/${team_id}/routing-rules`, {
                body: { data },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to set team routing rules');
        }
    },
});
