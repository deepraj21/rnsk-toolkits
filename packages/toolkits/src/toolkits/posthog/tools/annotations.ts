// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListAnnotations = tool({
  description:
    'Lists annotations — dated notes marking what changed (deploys, launches, incidents) so charts can be read in context. Filter by dashboard, insight, date range, or the type of thing they annotate. Needs annotation:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    dashboardId: z.coerce
      .number()
      .int()
      .optional()
      .describe('Only annotations attached to this dashboard'),
    insightId: z.coerce
      .number()
      .int()
      .optional()
      .describe('Only annotations attached to this insight'),
    createdAfter: z
      .string()
      .optional()
      .describe('Only annotations created on/after this date (2025-04-23 or -7d)'),
    createdBefore: z.string().optional().describe('Only annotations created before this date'),
    scope: z
      .enum(['dashboard_item', 'dashboard', 'project', 'organization', 'recording'])
      .optional()
      .describe('Restrict to annotations scoped to this object type'),
    limit: z.number().int().min(1).optional().describe('Max annotations per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    dashboardId,
    insightId,
    createdAfter,
    createdBefore,
    scope,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/annotations/`,
      {
        query: {
          dashboard_id: dashboardId,
          insight_id: insightId,
          created_after: createdAfter,
          created_before: createdBefore,
          scope,
          limit,
          offset,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateAnnotation = tool({
  description:
    'Creates an annotation — a dated marker explaining a spike or drop on charts (e.g. "v2 launch", "incident"). content and dateMarker are required; scope decides whether it sits on a dashboard, project, organization, or recording. Needs annotation:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    content: z.string().min(1).describe('What happened, e.g. "Launched new checkout flow"'),
    dateMarker: z.string().min(1).describe('When it happened (ISO 8601 timestamp or date)'),
    scope: z
      .enum(['dashboard_item', 'dashboard', 'project', 'organization', 'recording'])
      .optional()
      .describe('What the annotation is attached to (default dashboard_item)'),
    dashboardId: z.coerce
      .number()
      .int()
      .optional()
      .describe('Dashboard id when scope=dashboard or dashboard_item'),
    insightId: z.coerce.number().int().optional().describe('Insight id when scope=dashboard_item'),
    recordingId: z.string().optional().describe('Session recording id when scope=recording'),
    organizationId: z.string().optional().describe('Organization id when scope=organization'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    content,
    dateMarker,
    scope,
    dashboardId,
    insightId,
    recordingId,
    organizationId,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!content) return { error: 'content is required.' };
    if (!dateMarker) return { error: 'dateMarker is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/annotations/`,
      {
        method: 'POST',
        body: {
          content,
          date_marker: dateMarker,
          scope,
          dashboard_id: dashboardId,
          insight_id: insightId,
          recording_id: recordingId,
          organization_id: organizationId,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteAnnotation = tool({
  description:
    'Deletes an annotation. It disappears from every chart it annotated — confirm with the user first. Needs annotation:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    annotationId: z.coerce
      .number()
      .int()
      .describe('Annotation id to delete (from posthogListAnnotations)'),
  }),
  execute: async ({ posthogCredentials, projectId, annotationId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!annotationId) return { error: 'annotationId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/annotations/${annotationId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
