// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createCommitCommentReaction = tool({
    description: 'Create reaction for a commit comment.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        comment_id: z.number().describe('The unique identifier of the comment'),
        content: z.enum(['+1', '-1', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes']).describe('The reaction type to add'),
    }),
    execute: async ({ githubToken, owner, repo, comment_id, content }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.reactions.createForCommitComment({
                owner,
                repo,
                comment_id,
                content,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                content: data.content,
                user: data.user?.login,
                created_at: data.created_at,
            };
        } catch (error: any) {
            return { error: `Failed to create commit comment reaction: ${error.message}` };
        }
    },
});
