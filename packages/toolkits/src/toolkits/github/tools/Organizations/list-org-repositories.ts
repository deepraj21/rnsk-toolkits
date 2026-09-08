// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listOrgRepositories = tool({
    description: 'List repositories for an organization.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        type: z.enum(['all', 'public', 'private', 'forks', 'sources', 'member']).optional().describe('Specifies the types of repositories you want listed'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, org, type, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listForOrg({
                org,
                type: type ?? 'all',
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(repo => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                private: repo.private,
                owner: repo.owner.login,
                html_url: repo.html_url,
                description: repo.description,
                fork: repo.fork,
                url: repo.url,
                created_at: repo.created_at,
                updated_at: repo.updated_at,
                pushed_at: repo.pushed_at,
                git_url: repo.git_url,
                ssh_url: repo.ssh_url,
                clone_url: repo.clone_url,
                svn_url: repo.svn_url,
                homepage: repo.homepage,
                size: repo.size,
                stargazers_count: repo.stargazers_count,
                watchers_count: repo.watchers_count,
                language: repo.language,
                has_issues: repo.has_issues,
                has_projects: repo.has_projects,
                has_downloads: repo.has_downloads,
                has_wiki: repo.has_wiki,
                has_pages: repo.has_pages,
                forks_count: repo.forks_count,
                archived: repo.archived,
                disabled: repo.disabled,
                open_issues_count: repo.open_issues_count,
                license: repo.license,
                topics: repo.topics,
                visibility: (repo as any).visibility,
            }));
        } catch (error: any) {
            return { error: `Failed to list org repositories: ${error.message}` };
        }
    },
});
