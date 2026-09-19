// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceCreateSqlConsoleEmbed = tool({
    description: "Tool to create a SQL Console embed for querying datasets on Hugging Face. Use when you need to create a shareable SQL query interface for exploring dataset splits. The embed allows users to execute SQL queries against dataset views (e.g., train, test, validation splits).",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        sql: z.string().describe("The SQL query to be embedded in the console. This is the query users will see and can execute."),
        repo: z.string().describe("The name of the dataset repository without the namespace prefix."),
        title: z.string().max(200).describe("Title for the SQL console embed. Maximum 200 characters."),
        views: z.array(z.record(z.any())).min(1).describe("List of available views (splits) in the dataset that can be queried. Must contain at least one view."),
        isPrivate: z.boolean().optional().describe("Whether the SQL console embed should be private. If true, only authorized users can access it."),
        repoType: z.enum(["datasets"]).optional().describe("The type of repository. Currently only 'datasets' is supported."),
        namespace: z.string().describe("The namespace (username or organization) that owns the dataset repository."),
    }),
    execute: async ({ huggingFaceToken, sql, repo, title, views, isPrivate, repoType, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { sql: sql, title: title, views: views, private: isPrivate };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/datasets/${repoId}/sql-console/embeds`, queryParams, body });
    },
});

export const huggingFaceUpdateSqlConsoleEmbed = tool({
    description: "Tool to update an existing SQL console embed for a Hugging Face dataset. Use when you need to modify the SQL query, title, or privacy settings of an existing embed.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        id: z.string().describe("The slug identifier of the SQL console embed to update (not the _id). This is returned as 'slug' when creating an embed"),
        sql: z.string().optional().describe("The SQL query string to execute in the console embed"),
        repo: z.string().describe("The name of the dataset repository"),
        title: z.string().max(200).optional().describe("The title of the SQL console embed. Maximum 200 characters"),
        isPrivate: z.boolean().optional().describe("Whether the SQL console embed is private. Set to true to make it private, false to make it public"),
        namespace: z.string().describe("The namespace (username or organization) that owns the dataset repository"),
        repoType: z.enum(["datasets"]).describe("The type of repository. Currently only 'datasets' is supported"),
    }),
    execute: async ({ huggingFaceToken, id, sql, repo, title, isPrivate, namespace, repoType }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { sql: sql, title: title, private: isPrivate };
        return hfApi(huggingFaceToken, { method: 'PUT', url: `${HOSTS.HUB}/api/datasets/${repoId}/sql-console/embeds/${encodeURIComponent(id)}`, queryParams, body });
    },
});
