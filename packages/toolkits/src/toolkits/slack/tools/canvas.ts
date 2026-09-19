// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackCreateCanvas = tool({
    description:
        'Create a Canvas with an optional title, markdown content, and channel tab. Returns the canvas_id.',
    inputSchema: z.object({
        slackToken: tokenField,
        title: z.string().optional().describe('Canvas title (Slack defaults when omitted)'),
        documentContent: z.record(z.any()).optional().describe('Initial content, e.g. {type:"markdown",markdown:"# Hi"}'),
        channelId: z.string().optional().describe('Channel ID to add the canvas as a tab to'),
    }),
    execute: async ({ slackToken, title, documentContent, channelId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'canvases.create', {
                title,
                document_content: documentContent,
                channel_id: channelId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to create canvas');
        }
    },
});

export const slackEditCanvas = tool({
    description:
        'Edit a Canvas: replace whole content or a section, insert before/after/at start/at end, delete a section, or rename. Use slackLookupCanvasSections to find section IDs for targeted edits.',
    inputSchema: z.object({
        slackToken: tokenField,
        canvasId: z.string().describe('Canvas ID, e.g. F01234ABCDE'),
        operation: z
            .enum(['replace', 'insert_after', 'insert_before', 'insert_at_start', 'insert_at_end', 'delete', 'rename'])
            .optional()
            .default('replace')
            .describe('Edit operation'),
        sectionId: z.string().optional().describe('Target section (required for insert_after/before and delete)'),
        documentContent: z.record(z.any()).optional().describe('Content in Slack document format (not for delete/rename)'),
        titleContent: z.record(z.any()).optional().describe('New title in markdown format (rename only)'),
    }),
    execute: async ({ slackToken, canvasId, operation = 'replace', sectionId, documentContent, titleContent }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'canvases.edit', {
                canvas_id: canvasId,
                operation,
                section_id: sectionId,
                document_content: documentContent,
                title_content: titleContent,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to edit canvas');
        }
    },
});

export const slackDeleteCanvas = tool({
    description:
        'Permanently delete a Canvas. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        canvasId: z.string().describe('Canvas ID to delete'),
    }),
    execute: async ({ slackToken, canvasId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'canvases.delete', { canvas_id: canvasId });
        } catch (error) {
            return toSlackError(error, 'Failed to delete canvas');
        }
    },
});

export const slackLookupCanvasSections = tool({
    description:
        'Find section IDs in a Canvas by text criteria. Use the returned IDs with slackEditCanvas targeted operations.',
    inputSchema: z.object({
        slackToken: tokenField,
        canvasId: z.string().describe('Canvas ID to search, e.g. F01234ABCDE'),
        criteria: z.record(z.any()).describe('Search criteria, e.g. {contains_text:"Roadmap"}'),
    }),
    execute: async ({ slackToken, canvasId, criteria }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'canvases.sections.lookup', {
                canvas_id: canvasId,
                criteria,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to look up canvas sections');
        }
    },
});
