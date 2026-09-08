// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createCommitStatus = tool({
    description: 'Create a commit status.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        sha: z.string().describe('The SHA of the commit'),
        state: z.enum(['error', 'failure', 'pending', 'success']).describe('The state of the status'),
        target_url: z.string().optional().describe('The target URL to associate with this status'),
        description: z.string().optional().describe('A short description of the status'),
        context: z.string().optional().describe('A string label to differentiate this status from the status of other systems'),
    }),
    execute: async ({ githubToken, owner, repo, sha, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.createCommitStatus({
                owner,
                repo,
                sha,
                ...options,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                state: data.state,
                description: data.description,
                context: data.context,
                target_url: data.target_url,
            };
        } catch (error: any) {
            return { error: `Failed to create commit status: ${error.message}` };
        }
    },
});
