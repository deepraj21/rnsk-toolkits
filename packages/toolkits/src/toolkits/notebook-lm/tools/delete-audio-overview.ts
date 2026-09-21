// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, getEndpoint, parseResponseError } from './utils.js';

export const deleteAudioOverview = tool({
    description:
        'Permanently delete an audio overview from a NotebookLM Enterprise notebook. If still generating, this permanently cancels generation. Cannot be undone.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name containing the audio overview.'),
        audioOverviewId: z.string().min(1).describe('Audio overview UUID to delete. If generation is in progress, deletion cancels it. Use default to delete the single overview per notebook.'),
        location: z.string().optional().describe('Location override, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookId, audioOverviewId, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const notebookName = buildNotebookName(notebookId, projectNumber, location);
            const id = audioOverviewId === 'default' || audioOverviewId.includes('/') ? audioOverviewId : 'default';
            const url = `${endpoint}/${notebookName}/audioOverviews/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${notebookLmToken}` },
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to delete audio overview', details: err.details };
            }
            const text = await response.text();
            let data: unknown = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
            return { deletedAudioOverviewId: audioOverviewId, raw: data };
        } catch (error) {
            return { error: 'Error deleting audio overview', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
