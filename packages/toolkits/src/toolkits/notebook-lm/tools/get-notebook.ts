// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, getEndpoint, parseResponseError } from './utils.js';

export const getNotebook = tool({
    description: 'Retrieve a NotebookLM Enterprise notebook and its current source metadata by notebook ID.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name projects/PROJECT/locations/LOCATION/notebooks/NOTEBOOK_ID.'),
        location: z.string().optional().describe('Location override, defaults to global. Ignored if notebookId is full resource name.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region us/eu/global, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number override, defaults to -. Ignored if notebookId is full name.'),
    }),
    execute: async ({ notebookLmToken, notebookId, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const name = buildNotebookName(notebookId, projectNumber, location);
            const url = `${endpoint}/${name}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to get notebook', details: err.details };
            }
            const data = await response.json();
            return {
                notebookId: data.notebookId || data.name?.split('/').pop() || notebookId,
                name: data.name,
                title: data.title,
                emoji: data.emoji,
                sources: data.sources,
                metadata: data.metadata,
                raw: data,
            };
        } catch (error) {
            return { error: 'Error getting notebook', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
