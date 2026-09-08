// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const renderMarkdown = tool({
    description: 'Render a Markdown document.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        text: z.string().describe('The Markdown text to render'),
        mode: z.enum(['markdown', 'gfm']).optional().describe('The rendering mode'),
        context: z.string().optional().describe('The repository context to use when rendering links in GFM mode'),
    }),
    execute: async ({ githubToken, text, mode, context }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.markdown.render({
                text,
                mode: mode ?? 'markdown',
                context,
            });
            return { html: data };
        } catch (error: any) {
            return { error: `Failed to render markdown: ${error.message}` };
        }
    },
});
