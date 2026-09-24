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
        'Job full name with folder path segments separated by slashes, e.g. "my-job" or "frontend/web-app".',
    );
const buildField = z
    .string()
    .describe('Build number, e.g. "42". Use getLastBuild for symbolic names like lastBuild.');

function toBuildPath(jobName: string, buildNumber: string): string {
    return `${toJobPath(jobName)}/${encodeURIComponent(buildNumber)}`;
}

export const listBuilds = tool({
    description:
        'List recent builds of a Jenkins job with number, URL, result, building state, timestamp and duration. Use to find build numbers before fetching logs or details.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        limit: z
            .number()
            .int()
            .min(1)
            .max(100)
            .optional()
            .describe('Max builds to return (default 20)'),
    }),
    execute: async ({ jenkinsCredentials, jobName, limit }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/api/json`,
                {
                    query: {
                        tree: `builds[number,url,result,building,timestamp,duration,description,displayName]{0,${limit ?? 20}}`,
                    },
                },
            );
            if (!result.ok)
                return failedResult(`Failed to list builds for job "${jobName}"`, result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error listing builds for job "${jobName}"`);
        }
    },
});

export const getBuild = tool({
    description:
        'Get details of a single Jenkins build: result, duration, description, actions, artifacts, change sets and culprits. Use to check whether a build succeeded and what it produced.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        buildNumber: buildField,
    }),
    execute: async ({ jenkinsCredentials, jobName, buildNumber }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toBuildPath(jobName, buildNumber)}/api/json`,
            );
            if (!result.ok)
                return failedResult(`Failed to get build ${buildNumber} of job "${jobName}"`, result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error getting build ${buildNumber} of job "${jobName}"`);
        }
    },
});

export const getLastBuild = tool({
    description:
        'Get a symbolic build of a Jenkins job without knowing its number: lastBuild, lastSuccessfulBuild, lastFailedBuild, lastCompletedBuild, lastStableBuild or lastUnsuccessfulBuild.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        which: z
            .enum([
                'lastBuild',
                'lastSuccessfulBuild',
                'lastFailedBuild',
                'lastCompletedBuild',
                'lastStableBuild',
                'lastUnsuccessfulBuild',
            ])
            .optional()
            .describe('Which symbolic build to fetch (default lastBuild)'),
    }),
    execute: async ({ jenkinsCredentials, jobName, which }) => {
        try {
            const selector = which ?? 'lastBuild';
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/${selector}/api/json`,
            );
            if (!result.ok)
                return failedResult(`Failed to get ${selector} of job "${jobName}"`, result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error getting last build of job "${jobName}"`);
        }
    },
});

export const getConsoleLog = tool({
    description:
        'Get the full console output (plain text) of a Jenkins build. Use to diagnose build failures. For long or still-running builds prefer getProgressiveLog to page through output.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        buildNumber: buildField,
        maxLength: z
            .number()
            .int()
            .min(1000)
            .optional()
            .describe(
                'Truncate the log to this many trailing characters (default 100000) to avoid oversized responses',
            ),
    }),
    execute: async ({ jenkinsCredentials, jobName, buildNumber, maxLength }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toBuildPath(jobName, buildNumber)}/consoleText`,
                { accept: 'text/plain' },
            );
            if (!result.ok)
                return failedResult(
                    `Failed to get console log for build ${buildNumber} of job "${jobName}"`,
                    result,
                );
            const text = typeof result.data === 'string' ? result.data : String(result.data);
            const limit = maxLength ?? 100000;
            const truncated = text.length > limit;
            return {
                jobName,
                buildNumber,
                truncated,
                consoleLog: truncated ? text.slice(-limit) : text,
            };
        } catch (error) {
            return toJenkinsError(error, `Error getting console log for job "${jobName}"`);
        }
    },
});

export const getProgressiveLog = tool({
    description:
        'Page through a Jenkins build log with the progressiveText API. Pass start 0 on the first call, then feed back nextStart until hasMore is false. Works on running builds for live tailing.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        buildNumber: buildField,
        start: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe('Byte offset to start reading from (default 0; resume with nextStart)'),
    }),
    execute: async ({ jenkinsCredentials, jobName, buildNumber, start }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toBuildPath(jobName, buildNumber)}/logText/progressiveText`,
                { accept: 'text/plain', query: { start: start ?? 0 } },
            );
            if (!result.ok)
                return failedResult(
                    `Failed to get progressive log for build ${buildNumber} of job "${jobName}"`,
                    result,
                );
            const headers = result.headers ?? {};
            const nextStart = Number(headers['x-text-size'] ?? start ?? 0);
            return {
                jobName,
                buildNumber,
                start: start ?? 0,
                nextStart: Number.isFinite(nextStart) ? nextStart : start ?? 0,
                hasMore: String(headers['x-more-data'] ?? '').toLowerCase() === 'true',
                logChunk: typeof result.data === 'string' ? result.data : String(result.data),
            };
        } catch (error) {
            return toJenkinsError(error, `Error getting progressive log for job "${jobName}"`);
        }
    },
});

export const getTestReport = tool({
    description:
        'Get the aggregated JUnit test report of a Jenkins build: pass/fail/skip counts and per-suite results. Requires the job to publish test results.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        buildNumber: buildField,
    }),
    execute: async ({ jenkinsCredentials, jobName, buildNumber }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toBuildPath(jobName, buildNumber)}/testReport/api/json`,
            );
            if (!result.ok)
                return failedResult(
                    `Failed to get test report for build ${buildNumber} of job "${jobName}"`,
                    result,
                );
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error getting test report for job "${jobName}"`);
        }
    },
});

export const triggerBuild = tool({
    description:
        'Trigger a new build of a Jenkins job without parameters (POST /job/NAME/build). For parameterized jobs use triggerParameterizedBuild. Returns the queue item URL so the build can be tracked.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        delaySeconds: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe('Quiet-period delay before the build starts, in seconds'),
    }),
    execute: async ({ jenkinsCredentials, jobName, delaySeconds }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/build`,
                { method: 'POST', query: delaySeconds ? { delay: `${delaySeconds}sec` } : undefined },
            );
            if (!result.ok)
                return failedResult(`Failed to trigger build for job "${jobName}"`, result);
            return {
                success: true,
                jobName,
                statusCode: result.status,
                queueItemUrl: result.headers?.location ?? null,
            };
        } catch (error) {
            return toJenkinsError(error, `Error triggering build for job "${jobName}"`);
        }
    },
});

export const triggerParameterizedBuild = tool({
    description:
        'Trigger a new build of a parameterized Jenkins job (POST /job/NAME/buildWithParameters). Pass job parameters as a key-value map; Jenkins coerces them to the declared parameter types.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        parameters: z
            .record(z.any())
            .describe('Job parameters as key-value pairs, e.g. {"BRANCH":"main","DEPLOY":true}'),
        delaySeconds: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe('Quiet-period delay before the build starts, in seconds'),
    }),
    execute: async ({ jenkinsCredentials, jobName, parameters, delaySeconds }) => {
        try {
            const query: Record<string, string | number | boolean | undefined> = {};
            for (const [key, value] of Object.entries(parameters ?? {})) {
                query[key] = typeof value === 'string' ? value : JSON.stringify(value);
            }
            if (delaySeconds) query.delay = `${delaySeconds}sec`;
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toJobPath(jobName)}/buildWithParameters`,
                { method: 'POST', query },
            );
            if (!result.ok)
                return failedResult(
                    `Failed to trigger parameterized build for job "${jobName}"`,
                    result,
                );
            return {
                success: true,
                jobName,
                statusCode: result.status,
                queueItemUrl: result.headers?.location ?? null,
            };
        } catch (error) {
            return toJenkinsError(error, `Error triggering parameterized build for job "${jobName}"`);
        }
    },
});

export const stopBuild = tool({
    description: 'Abort a running Jenkins build. The build is marked ABORTED but kept in history.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        buildNumber: buildField,
    }),
    execute: async ({ jenkinsCredentials, jobName, buildNumber }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toBuildPath(jobName, buildNumber)}/stop`,
                { method: 'POST' },
            );
            if (!result.ok)
                return failedResult(
                    `Failed to stop build ${buildNumber} of job "${jobName}"`,
                    result,
                );
            return { success: true, jobName, buildNumber, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error stopping build ${buildNumber} of job "${jobName}"`);
        }
    },
});

export const deleteBuild = tool({
    description: 'Permanently delete a single Jenkins build (console log, artifacts and test results).',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        jobName: jobField,
        buildNumber: buildField,
    }),
    execute: async ({ jenkinsCredentials, jobName, buildNumber }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `${toBuildPath(jobName, buildNumber)}/doDelete`,
                { method: 'POST' },
            );
            if (!result.ok)
                return failedResult(
                    `Failed to delete build ${buildNumber} of job "${jobName}"`,
                    result,
                );
            return { success: true, jobName, buildNumber, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error deleting build ${buildNumber} of job "${jobName}"`);
        }
    },
});
