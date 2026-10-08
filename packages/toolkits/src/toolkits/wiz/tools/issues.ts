// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wizGraphql, failedResult, toWizError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

const ISSUES_QUERY = `query IssuesTable($filterBy: IssueFilters, $first: Int, $after: String) {
  issues: issuesV2(filterBy: $filterBy, first: $first, after: $after) {
    nodes {
      id
      status
      severity
      createdAt
      updatedAt
      sourceRule { id name }
      entitySnapshot { id name type subscriptionExternalId cloudPlatform }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

const ISSUE_QUERY = `query IssueDetails($issueId: ID!) {
  issue: issueV2(id: $issueId) {
    id
    status
    severity
    createdAt
    updatedAt
    note
    sourceRule { id name description remediationInstructions }
    entitySnapshot { id name type subscriptionExternalId cloudPlatform region }
  }
}`;

export const wizListIssues = tool({
  description:
    'List Wiz security issues (GraphQL issuesV2) with optional filters and cursor pagination.',
  inputSchema: z.object({
    wizCredentials: credField,
    first: z.number().int().min(1).max(500).optional().describe('Page size (default 50)'),
    after: z.string().optional().describe('endCursor from prior pageInfo'),
    status: z
      .array(z.string())
      .optional()
      .describe('Filter statuses, e.g. OPEN, IN_PROGRESS, RESOLVED'),
    severity: z.array(z.string()).optional().describe('Filter severities, e.g. CRITICAL, HIGH'),
    search: z.string().optional().describe('Free-text search on issue fields'),
  }),
  execute: async ({ wizCredentials, first, after, status, severity, search }) => {
    try {
      const filterBy: Record<string, unknown> = {};
      if (status?.length) filterBy.status = status;
      if (severity?.length) filterBy.severity = severity;
      if (search) filterBy.search = search;
      const result = await wizGraphql(wizCredentials, ISSUES_QUERY, {
        first: first ?? 50,
        after,
        filterBy: Object.keys(filterBy).length ? filterBy : undefined,
      });
      if (!result.ok) return failedResult('Failed to list Wiz issues', result);
      return result.data;
    } catch (error) {
      return toWizError(error, 'Error listing Wiz issues');
    }
  },
});

export const wizGetIssue = tool({
  description: 'Get one Wiz issue by ID (GraphQL issueV2).',
  inputSchema: z.object({
    wizCredentials: credField,
    issueId: z.string().describe('Wiz issue ID'),
  }),
  execute: async ({ wizCredentials, issueId }) => {
    try {
      const result = await wizGraphql(wizCredentials, ISSUE_QUERY, { issueId });
      if (!result.ok) return failedResult('Failed to get Wiz issue', result);
      return result.data;
    } catch (error) {
      return toWizError(error, 'Error getting Wiz issue');
    }
  },
});
