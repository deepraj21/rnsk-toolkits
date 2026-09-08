// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createDeployment = tool({
    description: 'Create a deployment for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('The ref to deploy (e.g., branch name, tag, or SHA)'),
        task: z.string().optional().describe('Specifies a task to execute (e.g., deploy or deploy:migrations)'),
        auto_merge: z.boolean().optional().describe('Attempts to automatically merge the default branch into the requested ref, if it\'s behind the default branch'),
        required_contexts: z.array(z.string()).optional().describe('The status contexts that must be in a success state for a deployment to be created'),
        payload: z.string().optional().describe('JSON payload with extra information about the deployment'),
        environment: z.string().optional().describe('Name for the target deployment environment (e.g., production, staging)'),
        description: z.string().optional().describe('Short description of the deployment'),
        transient_environment: z.boolean().optional().describe('Specifies if the given environment is specific to the deployment and will no longer exist at some point'),
        production_environment: z.boolean().optional().describe('Specifies if the given environment is one that end-users directly interact with'),
    }),
    execute: async ({ githubToken, owner, repo, ref, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.createDeployment({
                owner,
                repo,
                ref,
                ...options,
                payload: options.payload ? JSON.parse(options.payload) : undefined,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: (data as any).id,
                sha: (data as any).sha,
                ref: (data as any).ref,
                task: (data as any).task,
                environment: (data as any).environment,
                description: (data as any).description,
                created_at: (data as any).created_at,
            };
        } catch (error: any) {
            return { error: `Failed to create deployment: ${error.message}` };
        }
    },
});
