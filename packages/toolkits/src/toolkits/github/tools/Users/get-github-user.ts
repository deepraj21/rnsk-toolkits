// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getGitHubUser = tool({
  description:
    'Get the authenticated GitHub user profile. Returns detailed information including login, name, email, plan, usage, and repository counts.',
  inputSchema: z.object({
    githubToken: z.string().optional().describe('Injected by system; do not provide'),
  }),
  execute: async ({ githubToken }) => {
    if (!githubToken) {
      return { error: 'GitHub token is required. Connect GitHub first.' };
    }
    const octokit = new Octokit({ auth: githubToken });
    try {
      const { data } = await octokit.rest.users.getAuthenticated();
      return {
        id: data.id,
        login: data.login,
        name: data.name ?? null,
        email: data.email ?? null,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
        bio: data.bio ?? null,
        company: data.company ?? null,
        blog: data.blog ?? null,
        location: data.location ?? null,
        hireable: data.hireable ?? null,
        public_repos: data.public_repos,
        public_gists: data.public_gists,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
        updated_at: data.updated_at,
        total_private_repos: data.total_private_repos,
        owned_private_repos: data.owned_private_repos,
        disk_usage: data.disk_usage,
        collaborators: data.collaborators,
        two_factor_authentication: (data as any).two_factor_authentication,
        plan: data.plan,
      };
    } catch (error: any) {
      return { error: `Failed to get authenticated user: ${error.message}` };
    }
  },
});
