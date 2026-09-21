// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, buildParent, getEndpoint, parseResponseError } from './utils.js';

export const deleteNotebooks = tool({
    description: 'Permanently delete one or more NotebookLM Enterprise notebooks by notebook ID. Handles Google single-notebook batchDelete limit by normalizing to full resource names.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookIds: z.array(z.string().min(1)).min(1).max(100).describe('One to 100 notebook UUIDs or full resource names to permanently delete.'),
        location: z.string().optional().describe('Location override, defaults to global. Used when notebookIds are UUIDs.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookIds, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const parent = buildParent(projectNumber, location);
            const names = notebookIds.map((id) => buildNotebookName(id, projectNumber, location));
            const url = `${endpoint}/${parent}/notebooks:batchDelete`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ names }),
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to delete notebooks', details: err.details };
            }
            const text = await response.text();
            let data: unknown = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
            return { deletedNotebookIds: notebookIds, raw: data };
        } catch (error) {
            return { error: 'Error deleting notebooks', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
