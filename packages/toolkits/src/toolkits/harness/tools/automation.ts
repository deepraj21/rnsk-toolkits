// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, harnessRequest, toHarnessError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Harness credentials JSON with apiKey and optional baseUrl, e.g. {"apiKey":"..."} (defaults to https://app.harness.io; EU uses https://app.eu.harness.io).',
    );
const scopeFields = {
    accountIdentifier: z.string().describe('Harness account identifier'),
    orgIdentifier: z.string().describe('Organization identifier'),
    projectIdentifier: z.string().describe('Project identifier'),
};

export const listInputSets = tool({
    description:
        'List input sets of a Harness pipeline. Input sets store reusable runtime-input values for executions.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier owning the input sets'),
        page: z.number().int().min(0).optional().describe('Page index, starting at 0'),
        size: z.number().int().min(1).max(100).optional().describe('Page size (default 20)'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, page, size }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/pipeline/api/inputSets', {
                query: { accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, page, size },
            });
            if (!result.ok) return failedResult('Failed to list Harness input sets', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error listing Harness input sets');
        }
    },
});

export const getInputSet = tool({
    description: 'Get a single Harness input set including its YAML values.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier owning the input set'),
        inputSetIdentifier: z.string().describe('Input set identifier'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, inputSetIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/inputSets/${encodeURIComponent(inputSetIdentifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness input set "${inputSetIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness input set "${inputSetIdentifier}"`);
        }
    },
});

export const createInputSet = tool({
    description: 'Create a Harness input set from an input-set YAML document.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier the input set belongs to'),
        inputSetYaml: z.string().describe('Complete input set YAML document starting with "inputSet:"'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, inputSetYaml }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/pipeline/api/inputSets', {
                method: 'POST',
                query: { accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier },
                body: inputSetYaml,
                contentType: 'application/yaml',
            });
            if (!result.ok) return failedResult('Failed to create Harness input set', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness input set');
        }
    },
});

export const updateInputSet = tool({
    description: 'Update a Harness input set by replacing its YAML.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier the input set belongs to'),
        inputSetIdentifier: z.string().describe('Input set identifier to update'),
        inputSetYaml: z.string().describe('Complete replacement input set YAML document'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, inputSetIdentifier, inputSetYaml }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/inputSets/${encodeURIComponent(inputSetIdentifier)}`,
                {
                    method: 'PUT',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier },
                    body: inputSetYaml,
                    contentType: 'application/yaml',
                },
            );
            if (!result.ok)
                return failedResult(`Failed to update Harness input set "${inputSetIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness input set "${inputSetIdentifier}"`);
        }
    },
});

export const deleteInputSet = tool({
    description: 'Delete a Harness input set.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        pipelineIdentifier: z.string().describe('Pipeline identifier the input set belongs to'),
        inputSetIdentifier: z.string().describe('Input set identifier to delete'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, inputSetIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/inputSets/${encodeURIComponent(inputSetIdentifier)}`,
                {
                    method: 'DELETE',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier },
                },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness input set "${inputSetIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness input set "${inputSetIdentifier}"`);
        }
    },
});

export const getTrigger = tool({
    description:
        'Get a Harness trigger by identifier: event source, pipeline target and runtime-input bindings. Use to inspect webhook, schedule or artifact triggers.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        triggerIdentifier: z.string().describe('Trigger identifier'),
        targetIdentifier: z.string().describe('Target pipeline identifier the trigger belongs to'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, triggerIdentifier, targetIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/triggers/${encodeURIComponent(triggerIdentifier)}`,
                { query: { accountIdentifier, orgIdentifier, projectIdentifier, targetIdentifier } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Harness trigger "${triggerIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error getting Harness trigger "${triggerIdentifier}"`);
        }
    },
});

export const createTrigger = tool({
    description:
        'Create a Harness trigger (webhook, schedule, artifact or manifest based) from a trigger YAML document.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        targetIdentifier: z.string().describe('Target pipeline identifier the trigger attaches to'),
        triggerYaml: z.string().describe('Complete trigger YAML document starting with "trigger:"'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, targetIdentifier, triggerYaml }) => {
        try {
            const result = await harnessRequest(harnessCredentials, '/pipeline/api/triggers', {
                method: 'POST',
                query: { accountIdentifier, orgIdentifier, projectIdentifier, targetIdentifier },
                body: triggerYaml,
                contentType: 'application/yaml',
            });
            if (!result.ok) return failedResult('Failed to create Harness trigger', result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, 'Error creating Harness trigger');
        }
    },
});

export const updateTrigger = tool({
    description: 'Update a Harness trigger by replacing its YAML.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        triggerIdentifier: z.string().describe('Trigger identifier to update'),
        targetIdentifier: z.string().describe('Target pipeline identifier the trigger attaches to'),
        triggerYaml: z.string().describe('Complete replacement trigger YAML document'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, triggerIdentifier, targetIdentifier, triggerYaml }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/triggers/${encodeURIComponent(triggerIdentifier)}`,
                {
                    method: 'PUT',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier, targetIdentifier },
                    body: triggerYaml,
                    contentType: 'application/yaml',
                },
            );
            if (!result.ok)
                return failedResult(`Failed to update Harness trigger "${triggerIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error updating Harness trigger "${triggerIdentifier}"`);
        }
    },
});

export const deleteTrigger = tool({
    description: 'Delete a Harness trigger so the pipeline no longer fires on its events.',
    inputSchema: z.object({
        harnessCredentials: credsField,
        ...scopeFields,
        triggerIdentifier: z.string().describe('Trigger identifier to delete'),
        targetIdentifier: z.string().describe('Target pipeline identifier the trigger attaches to'),
    }),
    execute: async ({ harnessCredentials, accountIdentifier, orgIdentifier, projectIdentifier, triggerIdentifier, targetIdentifier }) => {
        try {
            const result = await harnessRequest(
                harnessCredentials,
                `/pipeline/api/triggers/${encodeURIComponent(triggerIdentifier)}`,
                {
                    method: 'DELETE',
                    query: { accountIdentifier, orgIdentifier, projectIdentifier, targetIdentifier },
                },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Harness trigger "${triggerIdentifier}"`, result);
            return result.data;
        } catch (error) {
            return toHarnessError(error, `Error deleting Harness trigger "${triggerIdentifier}"`);
        }
    },
});
