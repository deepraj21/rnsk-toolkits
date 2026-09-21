// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogCreateSchedule = tool({
    description:
        'Create an On-Call schedule with rotation layers (members, intervals, time restrictions) and team links.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        data: z.record(z.any()).describe("JSON:API data object with type 'schedules' and attributes {name, time_zone, layers}"),
    }),
    execute: async ({ datadogCredentials, data }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', '/api/v2/on-call/schedules', {
                body: { data },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to create schedule');
        }
    },
});

export const datadogGetSchedule = tool({
    description:
        'Get an On-Call schedule by ID with layers and team links.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        schedule_id: z.string().describe('Schedule ID'),
    }),
    execute: async ({ datadogCredentials, schedule_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v2/on-call/schedules/${schedule_id}`);
        } catch (error) {
            return toDatadogError(error, 'Failed to get schedule');
        }
    },
});

export const datadogUpdateSchedule = tool({
    description:
        'Update an On-Call schedule by ID. The data object must include the schedule id and full attributes.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        schedule_id: z.string().describe('Schedule ID to update'),
        data: z.record(z.any()).describe("JSON:API data object with id, type 'schedules', and attributes {name, time_zone, layers}"),
    }),
    execute: async ({ datadogCredentials, schedule_id, data }) => {
        try {
            return await ddApi(datadogCredentials, 'PUT', `/api/v2/on-call/schedules/${schedule_id}`, {
                body: { data },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to update schedule');
        }
    },
});

export const datadogDeleteSchedule = tool({
    description:
        'Delete an On-Call schedule by ID. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        schedule_id: z.string().describe('Schedule ID to delete'),
    }),
    execute: async ({ datadogCredentials, schedule_id }) => {
        try {
            await ddApi(datadogCredentials, 'DELETE', `/api/v2/on-call/schedules/${schedule_id}`);
            return { deleted: true, schedule_id };
        } catch (error) {
            return toDatadogError(error, 'Failed to delete schedule');
        }
    },
});

export const datadogGetScheduledOnCallUser = tool({
    description:
        'Get the currently scheduled on-call user for a schedule. Use during incidents to find who to page.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        schedule_id: z.string().describe('Schedule ID'),
    }),
    execute: async ({ datadogCredentials, schedule_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v2/on-call/schedules/${schedule_id}/on-call`);
        } catch (error) {
            return toDatadogError(error, 'Failed to get scheduled on-call user');
        }
    },
});
