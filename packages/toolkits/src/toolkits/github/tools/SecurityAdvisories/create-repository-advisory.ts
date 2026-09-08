// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createRepositoryAdvisory = tool({
    description: 'Create a repository security advisory.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        summary: z.string().describe('A short summary of the advisory'),
        description: z.string().describe('A detailed description of the advisory'),
        cve_id: z.string().optional().describe('The CVE ID to associate with this advisory'),
        vulnerabilities: z.array(z.object({
            package: z.object({
                ecosystem: z.enum(["actions", "rubygems", "npm", "pip", "maven", "nuget", "composer", "go", "rust", "erlang", "pub", "other", "swift"]).describe('The package ecosystem'),
                name: z.string().describe('The package name'),
            }),
            vulnerable_version_range: z.string().describe('The range of the package versions affected by the vulnerability'),
            patched_versions: z.string().optional().describe('The package version(s) that patch the vulnerability'),
            vulnerable_functions: z.array(z.string()).optional().describe('A list of the functions affected by the vulnerability'),
        })).describe('A list of vulnerabilities for this advisory'),
        severity: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('The severity of the advisory'),
        common_weakness_enumeration_ids: z.array(z.string()).optional().describe('A list of Common Weakness Enumeration (CWE) IDs'),
    }),
    execute: async ({ githubToken, owner, repo, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.securityAdvisories.createRepositoryAdvisory({
                owner,
                repo,
                ...options,
            } as any);
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                ghsa_id: data.ghsa_id,
                summary: data.summary,
                severity: data.severity,
                state: data.state,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to create repository advisory: ${error.message}` };
        }
    },
});
