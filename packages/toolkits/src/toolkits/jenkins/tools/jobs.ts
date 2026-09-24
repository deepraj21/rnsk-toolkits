// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, jenkinsRequest, toJenkinsError, toJobPath } from './client.js';

const credsField = z
    .string()
    .describe(
        'Jenkins credentials JSON with baseUrl plus username and apiToken, e.g. {"baseUrl":"https://jenkins.example.com","username":"ci-bot","apiToken":"..."}',
    );
const jobField = z
    .string()
    .describe(
        'Job full name with folder path segments separated by slashes, e.g. "my-job" or "frontend/web-app". Jobs inside folders are addressed by path.',
    );

export const listJobs = tool({
    description:
        'List jobs on the Jenkins controller. Returns each job name, full name, URL, color (status), and whether it is buildable or in the queue. Use first to discover job names before triggering builds or reading build history.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        tree: z
            .string()
            .optional()
            .describe(
                'Optional Jenkins tree query to customize returned fields, e.g. "jobs[name,color,lastBuild[number,result]]". Defaults to a summary of name, status and build state.',
            ),
    }),
    execute: async ({ jenkinsCredentials, tree }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/api/json', {
                query: {
                    tree:
                        tree ??
                        'jobs[name,fullName,url,color,buildable,inQueue,lastBuild[number,url,result,building,timestamp]]',
                },
            });
            if (!result.ok) return failedResult('Failed to list Jenkins jobs', result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, 'Error listing Jenkins jobs');
        }
    },
});

export const getJob = tool({
    description:
        'Get details of a Jenkins job: description, buildable/disabled state, health reports, recent builds, and properties. Use to inspect a job before triggering or modifying it.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
    }),
    execute: async ({ jenkinsCredentials, jobName }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/api/json`,
            );
            if (!result.ok) return failedResult(`Failed to get Jenkins job "${jobName}"`, result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error getting Jenkins job "${jobName}"`);
        }
    },
});

export const getJobConfig = tool({
    description:
        'Get the raw config.xml of a Jenkins job. Use to read SCM, triggers, builders and publishers configuration, or to fetch XML before updating it with updateJobConfig.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
    }),
    execute: async ({ jenkinsCredentials, jobName }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/config.xml`,
                { accept: 'application/xml' },
            );
            if (!result.ok)
                return failedResult(`Failed to get config.xml for job "${jobName}"`, result);
            return { jobName, configXml: result.data };
        } catch (error) {
            return toJenkinsError(error, `Error getting config.xml for job "${jobName}"`);
        }
    },
});

export const createJob = tool({
    description:
        'Create a new Jenkins job from a config.xml document. Pass the new job name and the full job configuration XML (copy it from a similar job via getJobConfig when migrating or templating jobs).',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        name: z.string().describe('Name for the new job'),
        configXml: z.string().describe('Full Jenkins job config.xml document for the new job'),
    }),
    execute: async ({ jenkinsCredentials, name, configXml }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/createItem', {
                method: 'POST',
                query: { name },
                body: configXml,
                contentType: 'application/xml',
            });
            if (!result.ok) return failedResult(`Failed to create Jenkins job "${name}"`, result);
            return { success: true, name, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error creating Jenkins job "${name}"`);
        }
    },
});

export const copyJob = tool({
    description:
        'Copy an existing Jenkins job to a new name (same folder). Use to duplicate a job instead of hand-writing config.xml.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        from: z.string().describe('Existing job name to copy from (slash-separated folder path allowed)'),
        name: z.string().describe('Name for the new copied job'),
    }),
    execute: async ({ jenkinsCredentials, from, name }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/createItem', {
                method: 'POST',
                query: { name, from, mode: 'copy' },
            });
            if (!result.ok)
                return failedResult(`Failed to copy Jenkins job "${from}" to "${name}"`, result);
            return { success: true, from, name, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error copying Jenkins job "${from}"`);
        }
    },
});

export const updateJobConfig = tool({
    description:
        'Update a Jenkins job by replacing its config.xml. Fetch the current XML with getJobConfig, edit it, then post the full document back.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        configXml: z.string().describe('Complete replacement config.xml document for the job'),
    }),
    execute: async ({ jenkinsCredentials, jobName, configXml }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/config.xml`,
                { method: 'POST', body: configXml, contentType: 'application/xml' },
            );
            if (!result.ok)
                return failedResult(`Failed to update config.xml for job "${jobName}"`, result);
            return { success: true, jobName, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error updating config.xml for job "${jobName}"`);
        }
    },
});

export const enableJob = tool({
    description: 'Enable a disabled Jenkins job so it can be built and triggered by SCM polling or timers.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
    }),
    execute: async ({ jenkinsCredentials, jobName }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/enable`,
                { method: 'POST' },
            );
            if (!result.ok) return failedResult(`Failed to enable Jenkins job "${jobName}"`, result);
            return { success: true, jobName, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error enabling Jenkins job "${jobName}"`);
        }
    },
});

export const disableJob = tool({
    description:
        'Disable a Jenkins job so no new builds are scheduled (running builds continue). Use to pause a noisy or broken job without deleting it.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
    }),
    execute: async ({ jenkinsCredentials, jobName }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/disable`,
                { method: 'POST' },
            );
            if (!result.ok)
                return failedResult(`Failed to disable Jenkins job "${jobName}"`, result);
            return { success: true, jobName, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error disabling Jenkins job "${jobName}"`);
        }
    },
});

export const deleteJob = tool({
    description: 'Permanently delete a Jenkins job and all of its builds and artifacts. This cannot be undone.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
    }),
    execute: async ({ jenkinsCredentials, jobName }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/doDelete`,
                { method: 'POST' },
            );
            if (!result.ok)
                return failedResult(`Failed to delete Jenkins job "${jobName}"`, result);
            return { success: true, jobName, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error deleting Jenkins job "${jobName}"`);
        }
    },
});
