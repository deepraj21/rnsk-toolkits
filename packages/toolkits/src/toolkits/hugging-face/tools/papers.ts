// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceClaimSettingsPapersClaim = tool({
    description: "Tool to claim authorship of a paper on Hugging Face. Use when you need to associate yourself or another user with an ArXiv paper.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        paperId: z.string().describe("ArXiv paper identifier being claimed. This should be the ArXiv ID of the paper you want to claim authorship for."),
        targetUserId: z.string().min(24).max(24).optional().describe("HF user who should receive the claim. Must be a 24-character hexadecimal string representing the Hugging Face user ID. Only provide this if you need to assign the claim to a specific user."),
        claimAuthorId: z.string().min(24).max(24).optional().describe("Author entry on the paper being claimed. Must be a 24-character hexadecimal string representing the specific author entry on the paper. Only provide this if you need to specify a particular author entry."),
    }),
    execute: async ({ huggingFaceToken, paperId, targetUserId, claimAuthorId }) => {
        const queryParams = undefined;
        const body = { target_user_id: targetUserId, claim_author_id: claimAuthorId };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/papers/${encodeURIComponent(paperId)}/claim`, queryParams, body });
    },
});

export const huggingFaceCreatePapersComment = tool({
    description: "Tool to create a new comment on a Hugging Face paper. Use when you need to add comments or feedback to research papers on Hugging Face.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        comment: z.string().min(1).max(65536).describe("The comment text to post on the paper. Must be between 1 and 65536 characters."),
        paperId: z.string().describe("The unique identifier of the paper to comment on. This can be the paper ID (e.g., '2408.04619') or the full paper path."),
    }),
    execute: async ({ huggingFaceToken, comment, paperId }) => {
        const queryParams = undefined;
        const body = { comment: comment };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/papers/${encodeURIComponent(paperId)}/comment`, queryParams, body });
    },
});

export const huggingFaceCreatePapersCommentReply = tool({
    description: "Tool to create a reply to a comment on a Hugging Face paper. Use when you need to respond to an existing comment on a paper discussion.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        comment: z.string().min(1).max(65536).describe("The content of the reply comment."),
        paperId: z.string().describe("The unique identifier of the paper (e.g., '2312.09323')."),
        commentId: z.string().describe("The unique identifier of the comment to reply to (e.g., '65844ff1ee15e3c7fc034c97')."),
    }),
    execute: async ({ huggingFaceToken, comment, paperId, commentId }) => {
        const queryParams = undefined;
        const body = { comment: comment };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/papers/${encodeURIComponent(paperId)}/comment/${encodeURIComponent(commentId)}/reply`, queryParams, body });
    },
});

export const huggingFaceCreatePapersIndex = tool({
    description: "Tool to index a paper from arXiv by its ID on Hugging Face. Use when you need to make a paper searchable and accessible on the platform. Note: If the paper is already indexed, only its authors can re-index it.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        arxivId: z.string().describe("The arXiv ID of the paper to index (format: YYMM.NNNNN or YYMM.NNNN, e.g., '2411.19876' or '1234.5678'). Only the paper's authors can re-index if already indexed."),
    }),
    execute: async ({ huggingFaceToken, arxivId }) => {
        const queryParams = undefined;
        const body = { arxiv_id: arxivId };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/papers/index`, queryParams, body });
    },
});

export const huggingFaceGetDailyPapers = tool({
    description: "Tool to retrieve daily papers from Hugging Face. Use when you need to fetch the latest AI/ML research papers shared on Hugging Face.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        p: z.number().int().min(0).optional().describe("Page number for pagination (0-indexed). Defaults to 0."),
        date: z.string().optional().describe("Filter papers by specific date (YYYY-MM-DD format)."),
        sort: z.enum(["publishedAt", "trending"]).optional().describe("Sort option for daily papers."),
        week: z.string().optional().describe("Filter papers by specific week."),
        limit: z.number().int().min(1).optional().describe("Maximum number of papers to return per page. Defaults to 50."),
        month: z.string().optional().describe("Filter papers by specific month (YYYY-MM format)."),
        submitter: z.string().optional().describe("Filter papers by submitter username."),
    }),
    execute: async ({ huggingFaceToken, p, date, sort, week, limit, month, submitter }) => {
        const queryParams = { p: p, date: date, sort: sort, week: week, limit: limit, month: month, submitter: submitter };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/daily_papers`, queryParams });
    },
});

export const huggingFaceSearchPapers = tool({
    description: "Tool to perform hybrid semantic/full-text search on papers in Hugging Face. Use when you need to find research papers by keywords, topics, or authors.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        q: z.string().optional().describe("Search query string to find relevant papers. Use keywords, paper titles, or topics. Supports hybrid semantic and full-text search."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of papers to return. If not specified, the API will use its default limit."),
    }),
    execute: async ({ huggingFaceToken, q, limit }) => {
        const queryParams = { q: q, limit: limit };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/papers/search`, queryParams });
    },
});
