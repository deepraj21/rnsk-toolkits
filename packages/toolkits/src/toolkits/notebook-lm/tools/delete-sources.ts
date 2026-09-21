// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, buildSourceName, getEndpoint, parseResponseError } from './utils.js';

export const deleteSources = tool({
    description: 'Permanently remove one or more sources from a NotebookLM Enterprise notebook.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name containing the sources.'),
        sourceIds: z.array(z.string().min(1)).min(1).describe('Source UUIDs or full resource names to permanently remove.'),
        location: z.string().optional().describe('Location override, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookId, sourceIds, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const notebookName = buildNotebookName(notebookId, projectNumber, location);
            const names = sourceIds.map((sid) => buildSourceName(notebookId, sid, projectNumber, location));
            const url = `${endpoint}/${notebookName}/sources:batchDelete`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ names }),
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to delete sources', details: err.details };
            }
            const text = await response.text();
            let data: unknown = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
            return { deletedSourceIds: sourceIds, raw: data };
        } catch (error) {
            return { error: 'Error deleting sources', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
