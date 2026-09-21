// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogCreateEscalationPolicy = tool({
    description:
        'Create an On-Call escalation policy with steps (targets, assignment, timeouts), retries, and team links.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        data: z.record(z.any()).describe("JSON:API data object with type 'policies' and attributes {name, steps, retries?, resolve_page_on_policy_end?}"),
    }),
    execute: async ({ datadogCredentials, data }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', '/api/v2/on-call/escalation-policies', {
                body: { data },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to create escalation policy');
        }
    },
});

export const datadogGetEscalationPolicy = tool({
    description:
        'Get an On-Call escalation policy by ID with steps and team links.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        policy_id: z.string().describe('Escalation policy ID'),
    }),
    execute: async ({ datadogCredentials, policy_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v2/on-call/escalation-policies/${policy_id}`);
        } catch (error) {
            return toDatadogError(error, 'Failed to get escalation policy');
        }
    },
});

export const datadogUpdateEscalationPolicy = tool({
    description:
        'Update an On-Call escalation policy by ID. The data object must include the policy id and full attributes.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        policy_id: z.string().describe('Escalation policy ID to update'),
        data: z.record(z.any()).describe("JSON:API data object with id, type 'policies', and attributes {name, steps, ...}"),
    }),
    execute: async ({ datadogCredentials, policy_id, data }) => {
        try {
            return await ddApi(datadogCredentials, 'PUT', `/api/v2/on-call/escalation-policies/${policy_id}`, {
                body: { data },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to update escalation policy');
        }
    },
});

export const datadogDeleteEscalationPolicy = tool({
    description:
        'Delete an On-Call escalation policy by ID. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        policy_id: z.string().describe('Escalation policy ID to delete'),
    }),
    execute: async ({ datadogCredentials, policy_id }) => {
        try {
            await ddApi(datadogCredentials, 'DELETE', `/api/v2/on-call/escalation-policies/${policy_id}`);
            return { deleted: true, policy_id, status: 204 };
        } catch (error) {
            return toDatadogError(error, 'Failed to delete escalation policy');
        }
    },
});
