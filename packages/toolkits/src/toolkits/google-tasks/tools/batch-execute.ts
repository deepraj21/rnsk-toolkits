// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

const ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const;

export const batchExecute = tool({
    description:
        'Executes multiple Google Tasks API operations in a single tool call and returns structured per-item results. Use to reduce LLM tool invocations when doing bulk updates, moves, or deletes. Each sub-request still counts toward API quota.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        requests: z
            .array(
                z.object({
                    id: z.string().describe("Client-chosen unique id for this sub-request, e.g. 'task1'"),
                    method: z.enum(ALLOWED_METHODS).describe('HTTP method, must be uppercase'),
                    path: z
                        .string()
                        .describe(
                            "API endpoint path starting with '/tasks/v1/', e.g. '/tasks/v1/lists/@default/tasks'",
                        ),
                    query: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().describe('Query params as key-value pairs'),
                    headers: z.record(z.string()).optional().describe('Optional per-request headers'),
                    jsonBody: z.record(z.any()).optional().describe('JSON body for POST/PATCH/PUT requests'),
                }),
            )
            .min(1)
            .describe('Array of sub-requests to execute. Each returns its own result.'),
        maxRequests: z
            .number()
            .min(1)
            .max(1000)
            .optional()
            .describe('Maximum sub-requests allowed in a single batch (default 1000, caps response size)'),
    }),
    execute: async ({ googleTasksToken, requests, maxRequests }) => {
        try {
            const limit = maxRequests ?? 1000;
            if (requests.length > limit) {
                return { error: `Too many sub-requests: got ${requests.length}, max is ${limit}` };
            }

            const results: Array<Record<string, unknown>> = [];
            for (const sub of requests) {
                const method = String(sub.method).toUpperCase();
                if (!ALLOWED_METHODS.includes(method as (typeof ALLOWED_METHODS)[number])) {
                    results.push({ id: sub.id, status: 400, error: { message: `Unsupported method: ${sub.method}` } });
                    continue;
                }
                let path = sub.path;
                if (!path.startsWith('/tasks/v1/')) {
                    results.push({
                        id: sub.id,
                        status: 400,
                        error: { message: "path must start with '/tasks/v1/'" },
                    });
                    continue;
                }
                // Strip the '/tasks/v1' prefix since TASKS_API_BASE already includes it.
                path = path.slice('/tasks/v1'.length) || '/';

                const searchParams: Record<string, string | number | boolean | undefined> = {};
                if (sub.query) {
                    for (const [k, v] of Object.entries(sub.query)) {
                        searchParams[k] = v as string | number | boolean;
                    }
                }

                const result = await tasksApiRequest(googleTasksToken, path, {
                    method,
                    body: method === 'GET' || method === 'DELETE' ? undefined : sub.jsonBody,
                    searchParams,
                });

                if (!result.ok) {
                    const details = result.error as Record<string, unknown>;
                    const status =
                        typeof details?.status === 'number'
                            ? details.status
                            : typeof (details as Record<string, unknown>)?.code === 'number'
                              ? (details as Record<string, unknown>).code
                              : 400;
                    results.push({ id: sub.id, status, error: details });
                } else {
                    const status = method === 'POST' ? 201 : 200;
                    results.push({ id: sub.id, status, jsonBody: result.data });
                }
            }

            const successfulCount = results.filter(
                (r) => typeof r.status === 'number' && r.status >= 200 && r.status < 300,
            ).length;
            return {
                results,
                totalRequests: results.length,
                successfulCount,
                failedCount: results.length - successfulCount,
            };
        } catch (error) {
            return {
                error: 'Error executing batch',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
