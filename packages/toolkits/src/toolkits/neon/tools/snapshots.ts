// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon, setNested } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonDeleteProjectSnapshot = tool({
    description: "Deletes a specific snapshot for a project in Neon. Use when you need to remove an old or unnecessary snapshot to free up storage or clean up resources. **Note**: This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID. Format: alphanumeric with hyphens (e.g., 'proud-meadow-87189985'). Can be obtained from the list projects API."),
        snapshotId: z.string().describe("The snapshot ID. Format: 'snap-' prefix followed by alphanumeric characters (e.g., 'snap-wispy-union-ahw80v1u'). Can be obtained from the list snapshots API."),
    }),
    execute: async ({ neonApiKey, projectId, snapshotId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/snapshots/${encodeURIComponent(snapshotId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonListProjectsSnapshots = tool({
    description: "Tool to list all snapshots for a specified Neon project. Use when you need to view available snapshots for backup, restore, or data recovery purposes. **Note**: This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID (e.g., 'proud-meadow-87189985'). You can obtain the project_id by listing projects for your Neon account."),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/snapshots`, method: 'GET', query: queryParams });
    },
});

export const neonRestoreSnapshot = tool({
    description: "Tool to restore a Neon snapshot to a new branch. Use when you need to recover data from a snapshot or create a branch from a previous point in time. This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        name: z.string().optional().describe("A name for the newly restored branch. If omitted, a default name will be generated."),
        projectId: z.string().describe("The Neon project ID (e.g., 'proud-meadow-87189985'). You can obtain the project_id by listing projects for your Neon account."),
        snapshotId: z.string().describe("The snapshot ID to restore (e.g., 'snap-wispy-union-ahw80v1u'). You can obtain snapshot IDs by listing snapshots for a project."),
        finalizeRestore: z.boolean().optional().describe("Set to true to finalize the restore operation immediately. This will complete the restore and move any associated computes to the new branch. Defaults to false to allow previewing the restored snapshot data first."),
        targetBranchId: z.string().optional().describe("The ID of the branch to restore the snapshot into. If not specified, the branch from which the snapshot was originally created will be used."),
    }),
    execute: async ({ neonApiKey, name, projectId, snapshotId, finalizeRestore, targetBranchId }) => {
        const queryParams = undefined;
        const body = {};
        if (name !== undefined) setNested(body, 'name', name);
        if (finalizeRestore !== undefined) setNested(body, 'finalize_restore', finalizeRestore);
        if (targetBranchId !== undefined) setNested(body, 'target_branch_id', targetBranchId);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/snapshots/${encodeURIComponent(snapshotId)}/restore`, method: 'POST', query: queryParams, body });
    },
});

export const neonUpdateProjectsSnapshots = tool({
    description: "Tool to update the name of a specific snapshot in a Neon project. Use when you need to rename a snapshot to better reflect its purpose or content. This endpoint is currently in Beta.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        name: z.string().describe("The new name for the snapshot. Use a descriptive name to identify the snapshot's purpose or content."),
        projectId: z.string().describe("The Neon project ID (e.g., 'proud-meadow-87189985'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
        snapshotId: z.string().describe("The snapshot ID to update (e.g., 'snap-wispy-union-ahw80v1u'). Must match pattern ^[a-z0-9-]{1,60}$."),
    }),
    execute: async ({ neonApiKey, name, projectId, snapshotId }) => {
        const queryParams = undefined;
        const body = {};
        if (name !== undefined) setNested(body, 'name', name);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/snapshots/${encodeURIComponent(snapshotId)}`, method: 'PATCH', query: queryParams, body });
    },
});
