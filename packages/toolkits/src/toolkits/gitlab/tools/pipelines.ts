// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { gitlabRequest, encodeId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const projectField = z
    .union([z.string(), z.number()])
    .describe('Project ID or URL-encoded path (e.g. 123 or "group/project")');

export const gitlabListPipelines = tool({
    description:
        'List GitLab CI/CD pipelines for a project. Use when the user asks to see pipeline runs, build status, or CI history.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        status: z.enum(['running', 'pending', 'success', 'failed', 'canceled', 'skipped', 'manual']).optional().describe('Filter by pipeline status'),
        ref: z.string().optional().describe('Filter by branch or tag name'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, projectId, status, ref, perPage = 20, page = 1 }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/pipelines`, {
            query: { status, ref, per_page: perPage, page },
        });
    },
});

export const gitlabGetPipeline = tool({
    description:
        'Get a single GitLab pipeline by ID. Use when the user asks for details or status of a specific pipeline run.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        pipelineId: z.union([z.string(), z.number()]).describe('Pipeline ID'),
    }),
    execute: async ({ gitlabToken, projectId, pipelineId }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/pipelines/${pipelineId}`);
    },
});

export const gitlabCreatePipeline = tool({
    description:
        'Create (trigger) a new GitLab CI/CD pipeline run for a branch or tag. Use when the user wants to run or retrigger CI.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        ref: z.string().describe('Branch or tag to run the pipeline on, e.g. "main"'),
        variables: z.array(z.object({ key: z.string(), value: z.string() })).optional().describe('CI/CD variables for the pipeline run'),
    }),
    execute: async ({ gitlabToken, projectId, ref, variables }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/pipeline`, {
            method: 'POST',
            body: { ref, variables },
        });
    },
});

export const gitlabListJobs = tool({
    description:
        'List jobs for a GitLab pipeline. Use when the user asks to see jobs, stages, or which job failed in a pipeline.',
    inputSchema: z.object({
        gitlabToken: tokenField,
        projectId: projectField,
        pipelineId: z.union([z.string(), z.number()]).describe('Pipeline ID'),
        perPage: z.number().min(1).max(100).optional().default(20).describe('Results per page (max 100)'),
        page: z.number().min(1).optional().default(1).describe('Page number'),
    }),
    execute: async ({ gitlabToken, projectId, pipelineId, perPage = 20, page = 1 }) => {
        return gitlabRequest(gitlabToken, `/projects/${encodeId(projectId)}/pipelines/${pipelineId}/jobs`, {
            query: { per_page: perPage, page },
        });
    },
});
