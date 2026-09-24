// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, harnessRequest, toHarnessError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Harness credentials JSON with apiKey and optional baseUrl, e.g. {"apiKey":"..."} (defaults to https://app.harness.io; EU uses https://app.eu.harness.io).',
    );
const accountField = z.string().describe('Harness account identifier');
const scopeFields = {
    accountIdentifier: accountField,
    orgIdentifier: z.string().describe('Organization identifier'),
    projectIdentifier: z.string().describe('Project identifier'),
};
const gitFields = {
    branch: z.string().optional().describe('Git branch for remote (Git Experience) pipelines'),
    repoIdentifier: z.string().optional().describe('Repository identifier for remote pipelines'),
};

export const listPipelines = tool({
    description:
        'List pipelines in a Harness project with identifiers, names, modules and last execution info. Use first to discover pipeline identifiers before running or inspecting them.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
        size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
        searchTerm: z.string().optional().describe('Filter pipelines by name or identifier'),
        module: z
            .string()
            .optional()
            .describe('Filter by module, e.g. "cd", "ci", "sto", "cf", "ce", "srm", "chaos", "iacm"'),
        ...gitFields,
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        page,
        size,
        searchTerm,
        module,
        branch,
        repoIdentifier,
    }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/pipeline/api/pipelines/list', {
                method: 'POST',
                query: {
                    accountIdentifier,
                    orgIdentifier,
                    projectIdentifier,
                    page,
                    size,
                    searchTerm,
                    module,
                    branch,
                    repoIdentifier,
                },
                body: { filterType: 'PipelineSetup' },
            });
            if (!result.ok) return failedResult('Failed to list Harness pipelines', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness pipelines');
        }
    },
});

export const getPipeline = tool({
    description:
        'Get a Harness pipeline definition including its YAML. Use to read stages, steps, variables and runtime inputs before editing or running it.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier'),
        ...gitFields,
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        branch,
        repoIdentifier,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipelines/${encodeURIComponent(pipelineIdentifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier, branch, repoIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness pipeline "${pipelineIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness pipeline "${pipelineIdentifier}"`);
        }
    },
});

export const getPipelineSummary = tool({
    description:
        'Get a compact summary of a Harness pipeline: name, module, deployment types, execution count and last execution status.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier'),
        ...gitFields,
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        branch,
        repoIdentifier,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipelines/summary/${encodeURIComponent(pipelineIdentifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier, branch, repoIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get summary of pipeline "${pipelineIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting summary of pipeline "${pipelineIdentifier}"`);
        }
    },
});

export const createPipeline = tool({
    description:
        'Create a Harness pipeline from a YAML document. Copy YAML from a similar pipeline via getPipeline when templating new ones.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineYaml: z.string().describe('Complete pipeline YAML document starting with "pipeline:"'),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        pipelineYaml,
    }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/pipeline/api/pipelines/v2', {
                method: 'POST',
                query: { accountIdentifier, orgIdentifier, projectIdentifier },
                body: pipelineYaml,
                contentType: 'application/yaml',
            });
            if (!result.ok) return failedResult('Failed to create Harness pipeline', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness pipeline');
        }
    },
});

export const updatePipeline = tool({
    description:
        'Update a Harness pipeline by replacing its YAML. Fetch the current YAML with getPipeline, edit it, then post the full document back.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier to update'),
        pipelineYaml: z.string().describe('Complete replacement pipeline YAML document'),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        pipelineYaml,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipelines/v2/${encodeURIComponent(pipelineIdentifier)}`,
                {
                    method: 'PUT',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier },
                    body: pipelineYaml,
                    contentType: 'application/yaml',
                },
            );
            if (!result.ok)
                return failedResult(`Failed to update Harness pipeline "${pipelineIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness pipeline "${pipelineIdentifier}"`);
        }
    },
});

export const deletePipeline = tool({
    description: 'Delete a Harness pipeline. Execution history is retained according to account settings.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier to delete'),
        ...gitFields,
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        branch,
        repoIdentifier,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipelines/${encodeURIComponent(pipelineIdentifier)}`,
                {
                    method: 'DELETE',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier, branch, repoIdentifier },
                },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness pipeline "${pipelineIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness pipeline "${pipelineIdentifier}"`);
        }
    },
});
