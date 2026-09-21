// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildSourceName, getEndpoint, parseResponseError } from './utils.js';

export const getSource = tool({
    description: 'Retrieve a notebook source ingestion status, metadata, and failure reason.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name containing the source.'),
        sourceId: z.string().min(1).describe('Source UUID or full resource name returned by add text sources or get notebook.'),
        location: z.string().optional().describe('Location override, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookId, sourceId, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const name = buildSourceName(notebookId, sourceId, projectNumber, location);
            const url = `${endpoint}/${name}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to get source', details: err.details };
            }
            const data = await response.json();
            const src = data.sources?.[0] || data;
            return {
                sourceId: src.sourceId?.id || src.sourceId || sourceId,
                name: src.name,
                title: src.title,
                metadata: src.metadata,
                ingestionStatus: src.settings?.status || src.ingestionStatus,
                failureReason: src.failureReason,
                raw: data,
            };
        } catch (error) {
            return { error: 'Error getting source', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
