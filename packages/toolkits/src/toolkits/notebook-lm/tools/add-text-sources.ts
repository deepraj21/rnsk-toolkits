// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, getEndpoint, parseResponseError } from './utils.js';

export const addTextSources = tool({
    description: 'Add one or more named raw-text sources to a NotebookLM Enterprise notebook via batchCreate.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name to receive the sources.'),
        sources: z.array(z.object({
            sourceName: z.string().min(1).describe('Display name for this source.'),
            content: z.string().min(1).describe('Raw text used to ground the notebook.'),
        })).min(1).describe('Text sources to add; each item contains a display name and raw text content.'),
        location: z.string().optional().describe('Location override, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookId, sources, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const name = buildNotebookName(notebookId, projectNumber, location);
            const url = `${endpoint}/${name}/sources:batchCreate`;
            const userContents = sources.map((s) => ({ textContent: { sourceName: s.sourceName, content: s.content } }));
            const response = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ userContents }),
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to add text sources', details: err.details };
            }
            const data = await response.json();
            const normalized = (data.sources || []).map((src: any) => ({
                sourceId: src.sourceId?.id || src.sourceId || src.name?.split('/').pop(),
                name: src.name,
                title: src.title || src.displayName,
                metadata: src.metadata,
                ingestionStatus: src.settings?.status || src.ingestionStatus,
                failureReason: src.failureReason,
            }));
            return { sources: normalized, raw: data };
        } catch (error) {
            return { error: 'Error adding text sources', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
