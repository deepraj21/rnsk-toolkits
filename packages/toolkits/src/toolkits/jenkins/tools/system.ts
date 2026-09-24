// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, jenkinsRequest, toJenkinsError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Jenkins credentials JSON with baseUrl plus username and apiToken, e.g. {"baseUrl":"https://jenkins.example.com","username":"ci-bot","apiToken":"..."}',
    );

export const getServerInfo = tool({
    description:
        'Get Jenkins controller info: version (from the X-Jenkins header), jobs and views overview, executor counts and quieting-down state. Use to verify connectivity and controller health.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
    }),
    execute: async ({ jenkinsCredentials }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/api/json');
            if (!result.ok) return failedResult('Failed to get Jenkins server info', result);
            return {
                version: result.headers?.['x-jenkins'] ?? null,
                ...result.data,
            };
        } catch (error) {
            return toJenkinsError(error, 'Error getting Jenkins server info');
        }
    },
});

export const listQueue = tool({
    description:
        'List items waiting in the Jenkins build queue with reason, ETA, waiting time and the task they belong to. Use to see pending builds after triggering jobs.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
    }),
    execute: async ({ jenkinsCredentials }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/queue/api/json');
            if (!result.ok) return failedResult('Failed to list Jenkins build queue', result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, 'Error listing Jenkins build queue');
        }
    },
});

export const getQueueItem = tool({
    description:
        'Get a single Jenkins queue item by id: why it is waiting, its ETA, and — once started — the executable build URL. Use to follow a triggered build from queue to executor.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        queueId: z.string().describe('Queue item id, e.g. "123". Returned as queueItemUrl by trigger tools.'),
    }),
    execute: async ({ jenkinsCredentials, queueId }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `/queue/item/${encodeURIComponent(queueId)}/api/json`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Jenkins queue item "${queueId}"`, result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error getting Jenkins queue item "${queueId}"`);
        }
    },
});

export const cancelQueueItem = tool({
    description: 'Cancel a waiting Jenkins build queue item so it never starts.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        queueId: z.string().describe('Queue item id to cancel, e.g. "123"'),
    }),
    execute: async ({ jenkinsCredentials, queueId }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/queue/cancelItem', {
                method: 'POST',
                query: { id: queueId },
            });
            if (!result.ok)
                return failedResult(`Failed to cancel Jenkins queue item "${queueId}"`, result);
            return { success: true, queueId, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, `Error cancelling Jenkins queue item "${queueId}"`);
        }
    },
});

export const listNodes = tool({
    description:
        'List Jenkins agents/nodes (including the built-in node) with display name, offline state, executor counts and load statistics. Use to check agent capacity and availability.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
    }),
    execute: async ({ jenkinsCredentials }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/computer/api/json', {
                query: {
                    tree: 'computer[displayName,offline,temporarilyOffline,numExecutors,oneOffExecutors,loadStatistics[busyExecutors,totalExecutors,queueLength]]',
                },
            });
            if (!result.ok) return failedResult('Failed to list Jenkins nodes', result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, 'Error listing Jenkins nodes');
        }
    },
});

export const getNode = tool({
    description: 'Get details of a single Jenkins agent: executors in use, monitor data (disk, clock, swap), and offline cause.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        nodeName: z
            .string()
            .describe('Agent name, e.g. "agent-1". Use "(built-in)" or "(master)" for the controller node.'),
    }),
    execute: async ({ jenkinsCredentials, nodeName }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `/computer/${encodeURIComponent(nodeName)}/api/json`,
                { query: { depth: 1 } },
            );
            if (!result.ok) return failedResult(`Failed to get Jenkins node "${nodeName}"`, result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error getting Jenkins node "${nodeName}"`);
        }
    },
});

export const listViews = tool({
    description: 'List views (tabs) configured on the Jenkins controller with name and URL.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
    }),
    execute: async ({ jenkinsCredentials }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/api/json', {
                query: { tree: 'views[name,url]' },
            });
            if (!result.ok) return failedResult('Failed to list Jenkins views', result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, 'Error listing Jenkins views');
        }
    },
});

export const getView = tool({
    description: 'Get a Jenkins view with the jobs it contains and their current status colors.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        viewName: z.string().describe('View name, e.g. "All" or "Backend"'),
    }),
    execute: async ({ jenkinsCredentials, viewName }) => {
        try {
            const result = await jenkinsRequest(
                jenkinsCredentials,
                `/view/${encodeURIComponent(viewName)}/api/json`,
            );
            if (!result.ok)
                return failedResult(`Failed to get Jenkins view "${viewName}"`, result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, `Error getting Jenkins view "${viewName}"`);
        }
    },
});

export const listPlugins = tool({
    description:
        'List plugins installed on the Jenkins controller with version, enabled state and whether an update is available. Use to audit capabilities (e.g. pipeline, credentials, SCM plugins).',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        depth: z
            .number()
            .int()
            .min(0)
            .max(2)
            .optional()
            .describe('API depth for plugin details (default 1)'),
    }),
    execute: async ({ jenkinsCredentials, depth }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/pluginManager/api/json', {
                query: { depth: depth ?? 1 },
            });
            if (!result.ok) return failedResult('Failed to list Jenkins plugins', result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, 'Error listing Jenkins plugins');
        }
    },
});

export const getCurrentUser = tool({
    description:
        'Get the Jenkins user the credentials authenticate as (id, full name and property). Use to verify an API token works and to check the login identity.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
    }),
    execute: async ({ jenkinsCredentials }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/me/api/json');
            if (!result.ok) return failedResult('Failed to get current Jenkins user', result);
            return result.data;
        } catch (error) {
            return toJenkinsError(error, 'Error getting current Jenkins user');
        }
    },
});

export const quietDown = tool({
    description:
        'Put Jenkins into quiet-down mode: no new builds start but running builds finish. Use before maintenance or restarts.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
        reason: z.string().optional().describe('Optional reason shown on the quiet-down page'),
    }),
    execute: async ({ jenkinsCredentials, reason }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/quietDown', {
                method: 'POST',
                query: reason ? { reason } : undefined,
            });
            if (!result.ok) return failedResult('Failed to quiet down Jenkins', result);
            return { success: true, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, 'Error quieting down Jenkins');
        }
    },
});

export const cancelQuietDown = tool({
    description: 'Cancel quiet-down mode so Jenkins accepts new builds again.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
    }),
    execute: async ({ jenkinsCredentials }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/cancelQuietDown', {
                method: 'POST',
            });
            if (!result.ok) return failedResult('Failed to cancel Jenkins quiet-down', result);
            return { success: true, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, 'Error cancelling Jenkins quiet-down');
        }
    },
});

export const safeRestart = tool({
    description:
        'Safely restart Jenkins: running jobs finish first, then the controller restarts. Prefer over restart to avoid killing in-flight builds.',
    inputSchema: z.object({
        jenkinsCredentials: credsField,
    }),
    execute: async ({ jenkinsCredentials }) => {
        try {
            const result = await jenkinsRequest(jenkinsCredentials, '/safeRestart', {
                method: 'POST',
            });
            if (!result.ok) return failedResult('Failed to safely restart Jenkins', result);
            return { success: true, statusCode: result.status };
        } catch (error) {
            return toJenkinsError(error, 'Error safely restarting Jenkins');
        }
    },
});
