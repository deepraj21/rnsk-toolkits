// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, getEndpoint, parseResponseError } from './utils.js';

export const createAudioOverview = tool({
    description:
        'Start asynchronous generation of a NotebookLM Enterprise audio overview from selected notebook sources. Each notebook can have only one audio overview; if one already exists, Google returns it and ignores new generation options. Returns before audio is ready; no status polling method exists in public API.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name whose sources will be used to generate the audio overview.'),
        sourceIds: z.array(z.string().min(1)).min(1).describe('One or more source UUIDs or full names from the notebook to include. If omitted by API, all sources are used.'),
        episodeFocus: z.string().optional().describe('Optional instructions describing the topics or angle the generated episode should emphasize.'),
        languageCode: z.string().optional().describe('Optional BCP-47 language code, e.g. en-US, fr-FR.'),
        location: z.string().optional().describe('Location override, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookId, sourceIds, episodeFocus, languageCode, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const name = buildNotebookName(notebookId, projectNumber, location);
            const url = `${endpoint}/${name}/audioOverviews`;
            const body: Record<string, unknown> = {};
            if (sourceIds && sourceIds.length) body.sourceIds = sourceIds.map((id) => ({ id }));
            if (episodeFocus) body.episodeFocus = episodeFocus;
            if (languageCode) body.languageCode = languageCode;
            const response = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to create audio overview', details: err.details };
            }
            const data = await response.json();
            const overview = data.audioOverview || data;
            return {
                audioOverviewId: overview.audioOverviewId || overview.name?.split('/').pop(),
                name: overview.name,
                status: overview.status,
                generationOptions: overview.generationOptions || body,
                raw: data,
            };
        } catch (error) {
            return { error: 'Error creating audio overview', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
