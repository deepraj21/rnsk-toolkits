// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRepoLicense = tool({
    description: 'Get the license for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
    }),
    execute: async ({ githubToken, owner, repo }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.licenses.getForRepo({
                owner,
                repo,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                name: data.name,
                path: data.path,
                sha: data.sha,
                size: data.size,
                url: data.url,
                html_url: data.html_url,
                git_url: data.git_url,
                download_url: data.download_url,
                type: data.type,
                content: data.content,
                encoding: data.encoding,
                _links: data._links,
                license: data.license,
            };
        } catch (error: any) {
            return { error: `Failed to get repo license: ${error.message}` };
        }
    },
});
