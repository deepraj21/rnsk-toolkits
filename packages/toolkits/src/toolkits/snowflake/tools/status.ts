// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snowflakeCredentialsField, statusPage } from './client.js';

/** Statuspage is public; the optional field keeps the schema non-empty and is ignored. */
const publicInput = {
    snowflakeCredentials: snowflakeCredentialsField.describe('Optional (ignored — the status page is public)'),
};

export const getStatusSummary = tool({
    description:
        'Reads the public status summary (overall indicator plus regional components, unresolved incidents, upcoming maintenance). Public — no credentials.',
    inputSchema: z.object({ ...publicInput }),
    execute: async () => statusPage('/summary.json', 'get status summary'),
});

export const getStatusRollup = tool({
    description: 'Reads the page rollup (blended indicator + human-readable description). Public — no credentials.',
    inputSchema: z.object({ ...publicInput }),
    execute: async () => statusPage('/status.json', 'get status rollup'),
});

export const getComponentStatus = tool({
    description: 'Lists per-component status (AWS/Azure/GCP regions). Limit is applied locally. Public — no credentials.',
    inputSchema: z.object({
        limit: z.number().int().min(1).optional().describe('Max components to return'),
    }),
    execute: async ({ limit }) => {
        const data: any = await statusPage('/components.json', 'get component status');
        if (data?.error) return data;
        if (limit !== undefined && Array.isArray(data?.components)) {
            return { ...data, components: data.components.slice(0, limit) };
        }
        return data;
    },
});

export const getUnresolvedIncidents = tool({
    description: 'Lists unresolved incidents (Investigating/Identified/Monitoring); empty when all clear. Public — no credentials.',
    inputSchema: z.object({ ...publicInput }),
    execute: async () => statusPage('/incidents/unresolved.json', 'get unresolved incidents'),
});

export const getActiveScheduledMaintenances = tool({
    description: "Lists maintenances In Progress or Verifying. Public — no credentials.",
    inputSchema: z.object({ ...publicInput }),
    execute: async () => statusPage('/scheduled-maintenances/active.json', 'get active scheduled maintenances'),
});

export const getUpcomingScheduledMaintenances = tool({
    description: "Lists maintenances still Scheduled (not started). Public — no credentials.",
    inputSchema: z.object({ ...publicInput }),
    execute: async () => statusPage('/scheduled-maintenances/upcoming.json', 'get upcoming scheduled maintenances'),
});

export const getAllScheduledMaintenances = tool({
    description: 'Lists the 50 most recent maintenances including Completed. Public — no credentials.',
    inputSchema: z.object({ ...publicInput }),
    execute: async () => statusPage('/scheduled-maintenances.json', 'get all scheduled maintenances'),
});
