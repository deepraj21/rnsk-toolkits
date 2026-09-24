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

export const runPipeline = tool({
    description:
        'Run (execute) a Harness pipeline, optionally supplying runtime inputs as YAML. Returns the plan execution ID used to track the run with getExecution.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier to execute'),
        moduleType: z
            .string()
            .optional()
            .describe('Module type, e.g. "cd" or "ci" (default cd)'),
        inputYaml: z
            .string()
            .optional()
            .describe(
                'Runtime inputs YAML for the run, e.g. "inputs:\\n  serviceRef: my_service\\n  environmentRef: prod". Omit to run with defaults.',
            ),
        branch: z.string().optional().describe('Git branch for remote pipelines'),
        repoIdentifier: z.string().optional().describe('Repository identifier for remote pipelines'),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        moduleType,
        inputYaml,
        branch,
        repoIdentifier,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipeline/execute/${encodeURIComponent(pipelineIdentifier)}`,
                {
                    method: 'POST',
                    query: {
                        accountIdentifier,
                        orgIdentifier,
                        projectIdentifier,
                        moduleType: moduleType ?? 'cd',
                        branch,
                        repoIdentifier,
                    },
                    body: inputYaml ?? '',
                    contentType: inputYaml ? 'application/yaml' : undefined,
                },
            );
            if (!result.ok)
                return failedResult(`Failed to run Harness pipeline "${pipelineIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error running Harness pipeline "${pipelineIdentifier}"`);
        }
    },
});

export const getExecution = tool({
    description:
        'Get the status and details of a Harness pipeline execution by plan execution ID: overall status, stage/step graph, start/end times and failure info.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        planExecutionId: z.string().describe('Plan execution ID returned by runPipeline'),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        planExecutionId,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipelines/execution/v2/${encodeURIComponent(planExecutionId)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get execution "${planExecutionId}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting execution "${planExecutionId}"`);
        }
    },
});

export const listExecutions = tool({
    description:
        'List pipeline executions in a Harness project with status, trigger info and timing. Use to review recent deploys or builds and to find execution IDs.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
        size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
        pipelineIdentifier: z.string().optional().describe('Filter executions of one pipeline'),
        status: z
            .string()
            .optional()
            .describe(
                'Filter by status, e.g. "Success", "Failed", "Running", "Aborted", "Expired"',
            ),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        page,
        size,
        pipelineIdentifier,
        status,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                '/pipeline/api/pipelines/execution/summary',
                {
                    method: 'POST',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier, page, size },
                    body: {
                        filterType: 'PipelineExecution',
                        ...(pipelineIdentifier || status
                            ? {
                                  pipelineExecutionFilter: {
                                      ...(pipelineIdentifier ? { pipelineIdentifiers: [pipelineIdentifier] } : {}),
                                      ...(status ? { statuses: [status] } : {}),
                                  },
                              }
                            : {}),
                    },
                },
            );
            if (!result.ok) return failedResult('Failed to list Harness executions', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness executions');
        }
    },
});

export const abortExecution = tool({
    description:
        'Abort (interrupt) a running Harness pipeline execution. Running stages are stopped and the execution is marked Aborted.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        planExecutionId: z.string().describe('Plan execution ID of the running execution'),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        planExecutionId,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipeline/execute/interrupt/${encodeURIComponent(planExecutionId)}`,
                {
                    method: 'PUT',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier, interruptType: 'Abort' },
                },
            );
            if (!result.ok)
                return failedResult(`Failed to abort execution "${planExecutionId}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error aborting execution "${planExecutionId}"`);
        }
    },
});

export const retryExecution = tool({
    description:
        'Retry a failed Harness pipeline execution from its failed stages. Pass the original plan execution ID and pipeline identifier.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier of the failed execution'),
        planExecutionId: z.string().describe('Plan execution ID of the failed execution to retry'),
        moduleType: z.string().optional().describe('Module type, e.g. "cd" or "ci" (default cd)'),
        runAllStages: z
            .boolean()
            .optional()
            .describe('Re-run all stages instead of only failed ones (default false)'),
    }),
    execute: async ({
        harnessCredentials,
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        planExecutionId,
        moduleType,
        runAllStages,
    }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/pipeline/execute/retry/${encodeURIComponent(pipelineIdentifier)}`,
                {
                    method: 'POST',
                    query: {
                        accountIdentifier,
                        orgIdentifier,
                        projectIdentifier,
                        moduleType: moduleType ?? 'cd',
                        planExecutionId,
                        runAllStages,
                    },
                },
            );
            if (!result.ok)
                return failedResult(`Failed to retry execution "${planExecutionId}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error retrying execution "${planExecutionId}"`);
        }
    },
});
