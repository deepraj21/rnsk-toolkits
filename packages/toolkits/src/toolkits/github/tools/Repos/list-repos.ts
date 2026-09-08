// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listRepos = tool({
  description:
    'List repositories for the authenticated GitHub user. Returns repo name, full_name, description, visibility, and URL. Use when the user asks to see their repos, list their repositories, or browse their GitHub repos.',
  inputSchema: z.object({
    githubToken: z.string().optional().describe('Injected by system; do not provide'),
    perPage: z.number().min(1).max(100).optional().default(30).describe('Number of repos per page (max 100)'),
    page: z.number().min(1).optional().default(1).describe('Page number'),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().default('updated').describe('Sort order'),
  }),
  execute: async ({ githubToken, perPage = 30, page = 1, sort = 'updated' }) => {
    if (!githubToken) {
      return { error: 'GitHub token is required. Connect GitHub first.' };
    }
    const octokit = new Octokit({ auth: githubToken });
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: perPage,
      page,
      sort,
    });
    return {
      repos: data.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description ?? null,
        visibility: repo.visibility ?? 'unknown',
        html_url: repo.html_url,
        private: repo.private,
      })),
      total: data.length,
    };
  },
});
