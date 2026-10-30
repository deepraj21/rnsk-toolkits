// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, compact } from './client.js';

export const netlifyCreateSite = tool({
  description:
    'Creates a Netlify site. Optionally connect a git repository (provider + repo + branch + build command + publish dir) so Netlify builds and deploys on push, or create a bare site and deploy to it later. Returns the new site with its id and URLs.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    name: z
      .string()
      .optional()
      .describe('Site name (subdomain). Omit to let Netlify generate one.'),
    customDomain: z
      .string()
      .optional()
      .describe('Custom production domain, e.g. "www.example.com"'),
    password: z.string().optional().describe('Password-protect the site (basic auth)'),
    forceSsl: z.boolean().optional().describe('Force HTTPS redirects (default true on new sites)'),
    repoProvider: z
      .string()
      .optional()
      .describe('Git provider to connect, e.g. "github", "gitlab", "bitbucket"'),
    repo: z
      .string()
      .optional()
      .describe('Repository path, e.g. "org/repo" (requires repoProvider)'),
    repoBranch: z.string().optional().describe('Branch to build, e.g. "main"'),
    repoDir: z.string().optional().describe('Publish directory, e.g. "dist"'),
    buildCommand: z.string().optional().describe('Build command, e.g. "npm run build"'),
    functionsDir: z.string().optional().describe('Functions directory, e.g. "netlify/functions"'),
    privateRepo: z.boolean().optional().describe('Whether the connected repository is private'),
  }),
  execute: async ({
    netlifyToken,
    name,
    customDomain,
    password,
    forceSsl,
    repoProvider,
    repo,
    repoBranch,
    repoDir,
    buildCommand,
    functionsDir,
    privateRepo,
  }) => {
    const repoInfo =
      repoProvider || repo
        ? compact({
            provider: repoProvider,
            repo,
            repo_branch: repoBranch,
            dir: repoDir,
            cmd: buildCommand,
            functions_dir: functionsDir,
            private: privateRepo,
          })
        : undefined;

    const body = compact({
      name,
      custom_domain: customDomain,
      password,
      force_ssl: forceSsl,
      repo: repoInfo && Object.keys(repoInfo).length ? repoInfo : undefined,
    });

    const result = await netlifyRequest(netlifyToken, '/sites', { method: 'POST', body });
    if (result.error) return result;
    return result.data;
  },
});
