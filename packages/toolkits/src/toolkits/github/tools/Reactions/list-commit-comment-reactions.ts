// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listCommitCommentReactions = tool({
    description: 'List reactions for a commit comment.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        comment_id: z.number().describe('The unique identifier of the comment'),
        content: z.enum(['+1', '-1', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes']).optional().describe('Returns only reactions with this content'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, comment_id, content, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.reactions.listForCommitComment({
                owner,
                repo,
                comment_id,
                content,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(reaction => ({
                id: reaction.id,
                content: reaction.content,
                user: reaction.user?.login,
                created_at: reaction.created_at,
            }));
        } catch (error: any) {
            return { error: `Failed to list commit comment reactions: ${error.message}` };
        }
    },
});
