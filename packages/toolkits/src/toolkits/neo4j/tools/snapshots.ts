// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { auraRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const instanceIdField = z.string().describe('Aura instance ID');

export const neo4jCreateSnapshot = tool({
    description:
        'Create an on-demand snapshot (backup) of a Neo4j Aura instance. Asynchronous; use the returned snapshot ID to monitor progress. Snapshot before migrations or bulk updates.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
    }),
    execute: async ({ neo4jCredentials, instanceId }) => {
        return auraRequest(neo4jCredentials, `/v1/instances/${encodeURIComponent(instanceId)}/snapshots`, {
            method: 'POST',
        });
    },
});

export const neo4jGetSnapshot = tool({
    description:
        'Get details of a specific Aura snapshot: profile, status, creation timestamp. Use to check backup progress.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
        snapshotId: z.string().describe('Snapshot ID'),
    }),
    execute: async ({ neo4jCredentials, instanceId, snapshotId }) => {
        return auraRequest(
            neo4jCredentials,
            `/v1/instances/${encodeURIComponent(instanceId)}/snapshots/${encodeURIComponent(snapshotId)}`,
        );
    },
});

export const neo4jListSnapshots = tool({
    description:
        'List scheduled and on-demand snapshots for an Aura instance with status and timestamps. Optionally filter to a single day.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
        date: z.string().optional().describe('Filter to a day, YYYY-MM-DD. Defaults to today.'),
    }),
    execute: async ({ neo4jCredentials, instanceId, date }) => {
        return auraRequest(neo4jCredentials, `/v1/instances/${encodeURIComponent(instanceId)}/snapshots`, {
            query: { date },
        });
    },
});

export const neo4jRestoreSnapshot = tool({
    description:
        'Restore an Aura instance from a snapshot, replacing all current data. IRREVERSIBLE: data since the snapshot is permanently lost. Confirm with the user first.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
        snapshotId: z.string().describe('Snapshot ID to restore from'),
    }),
    execute: async ({ neo4jCredentials, instanceId, snapshotId }) => {
        return auraRequest(neo4jCredentials, `/v1/instances/${encodeURIComponent(instanceId)}/restore`, {
            method: 'POST',
            body: { snapshot_id: snapshotId },
        });
    },
});
