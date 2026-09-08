// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getFileContent = tool({
    description: 'Get the content of a file from a GitHub repository. Returns decoded content if text, or info if binary/large.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        path: z.string().describe('Path to the file'),
        ref: z.string().optional().describe('Branch, tag, or commit SHA'),
    }),
    execute: async ({ githubToken, owner, repo, path, ref }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                ref,
            });

            if (Array.isArray(data)) {
                return { error: 'Path is a directory, not a file.' };
            }

            if ('content' in data && data.encoding === 'base64') {
                const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
                return {
                    name: data.name,
                    path: data.path,
                    sha: data.sha,
                    content: decoded,
                };
            }

            return {
                name: data.name,
                path: data.path,
                sha: data.sha,
                download_url: data.download_url,
                message: 'Content not returned in base64 (possibly too large or binary).',
            };
        } catch (error: any) {
            return { error: `Failed to get file content: ${error.message}` };
        }
    },
});
