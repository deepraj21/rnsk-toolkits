// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { promRequest, toPromError } from './client.js';

const credsField = z.string().describe('Prometheus credentials JSON with baseUrl and optional username/password or bearerToken');

export const deleteSeries = tool({
    description: 'Deletes series matching selectors in a time range (marks tombstones). Requires --enable-feature=admin-api (or web.enable-admin-api). Data is only physically removed after compaction/cleanup.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
        match: z.array(z.string()).min(1).describe('Series selectors to delete (at least one required)'),
        start: z.string().optional().describe('Range start, RFC3339 or unix timestamp'),
        end: z.string().optional().describe('Range end, RFC3339 or unix timestamp'),
    }),
    execute: async ({ prometheusCredentials, match, start, end }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/admin/tsdb/delete_series', {
                method: 'PUT',
                query: { 'match[]': match, start, end },
            });
        } catch (error) {
            return toPromError(error, 'Failed to delete series');
        }
    },
});

export const cleanTombstones = tool({
    description: 'Removes deleted data (tombstones) from disk and cleans up. Requires the admin API flag.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/admin/tsdb/clean_tombstones', {
                method: 'POST',
            });
        } catch (error) {
            return toPromError(error, 'Failed to clean tombstones');
        }
    },
});

export const snapshot = tool({
    description: 'Creates a TSDB snapshot for backups. Returns the snapshot directory name. Requires the admin API flag.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/api/v1/admin/tsdb/snapshot', {
                method: 'POST',
            });
        } catch (error) {
            return toPromError(error, 'Failed to create snapshot');
        }
    },
});

export const reloadConfig = tool({
    description: 'Reloads Prometheus configuration and rule files (like SIGHUP). Disabled by default; requires --web.enable-lifecycle.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/-/reload', {
                method: 'POST',
            });
        } catch (error) {
            return toPromError(error, 'Failed to reload config');
        }
    },
});

export const shutdownServer = tool({
    description: 'Triggers a graceful shutdown of Prometheus (like SIGTERM). Disabled by default; requires --web.enable-lifecycle. The server stops serving after this call.',
    inputSchema: z.object({
        prometheusCredentials: credsField,
    }),
    execute: async ({ prometheusCredentials }) => {
        try {
            return await promRequest(prometheusCredentials, '/-/quit', {
                method: 'POST',
            });
        } catch (error) {
            return toPromError(error, 'Failed to shut down server');
        }
    },
});
