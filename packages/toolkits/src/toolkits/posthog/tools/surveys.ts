// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListSurveys = tool({
  description:
    'Lists surveys in a project — name, type (popover, widget, external_survey, api), status (draft, running, complete), questions, and linked targeting flag. Filter by search, status, type, or feature flag. Needs survey:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z.string().optional().describe('Case-insensitive match on survey name and description'),
    status: z.enum(['draft', 'running', 'complete']).optional().describe('Filter by survey status'),
    type: z
      .enum(['popover', 'widget', 'external_survey', 'api'])
      .optional()
      .describe('Filter by survey type'),
    archived: z.boolean().optional().describe('Include archived surveys'),
    linkedFlagId: z.coerce
      .number()
      .int()
      .optional()
      .describe('Only surveys linked to this feature flag id'),
    ids: z.array(z.string()).optional().describe('Specific survey ids (comma-joined)'),
    createdBy: z.coerce.number().int().optional().describe('Only surveys created by this user id'),
    limit: z.number().int().min(1).optional().describe('Max surveys per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    search,
    status,
    type,
    archived,
    linkedFlagId,
    ids,
    createdBy,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/surveys/`, {
      query: {
        search,
        status,
        type,
        archived,
        linked_flag_id: linkedFlagId,
        ids,
        created_by: createdBy,
        limit,
        offset,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogGetSurvey = tool({
  description:
    'Gets one survey by id with its full definition — questions, branching logic, targeting flag, appearance, schedule, and status. Use it before updating a survey or interpreting its responses. Needs survey:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    surveyId: z.string().min(1).describe('Survey id (from posthogListSurveys)'),
  }),
  execute: async ({ posthogCredentials, projectId, surveyId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!surveyId) return { error: 'surveyId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/surveys/${surveyId}/`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogCreateSurvey = tool({
  description:
    'Creates a survey in draft. name and type are required (popover, widget, external_survey, api); questions look like [{"id":"0","type":"open","question":"How did you hear about us?"}] with types open, link, rating, single_choice, multiple_choice, nps, email, number, date, time. Targeted surveys manage a linked feature flag, so the key needs feature_flag:write too. Needs survey:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    name: z.string().min(1).describe('Survey name, e.g. "Onboarding feedback"'),
    type: z
      .enum(['popover', 'widget', 'external_survey', 'api'])
      .describe(
        'popover = popup on your site, widget = persistent widget, external_survey = your own page, api = responses via API',
      ),
    questions: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Question definitions — e.g. [{"id":"0","type":"rating","question":"How likely are you to recommend us?","scale":10,"lowerLabel":"Not likely","upperLabel":"Very likely"}]',
      ),
    description: z.string().optional().describe('Survey description shown to respondents'),
    schedule: z
      .enum(['once', 'recurring', 'always'])
      .optional()
      .describe('How often a matched user sees it: once, recurring, or always'),
    linkedFlagId: z.coerce
      .number()
      .int()
      .optional()
      .describe('Existing feature flag id used to target who sees the survey'),
    responsesLimit: z.coerce
      .number()
      .int()
      .optional()
      .describe('Stop collecting after this many responses'),
    archived: z.boolean().optional().describe('Create it pre-archived'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    name,
    type,
    questions,
    description,
    schedule,
    linkedFlagId,
    responsesLimit,
    archived,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!name) return { error: 'name is required.' };
    if (!type) return { error: 'type is required (popover, widget, external_survey, or api).' };

    const result = await posthogRequest(posthogCredentials, `/api/projects/${projectId}/surveys/`, {
      method: 'POST',
      body: {
        name,
        type,
        questions,
        description,
        schedule,
        linked_flag_id: linkedFlagId,
        responses_limit: responsesLimit,
        archived,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogUpdateSurvey = tool({
  description:
    'Updates a draft or running survey — change its name, questions, description, schedule, response limit, or linked targeting flag. Send only the fields to change. Needs survey:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    surveyId: z.string().min(1).describe('Survey id to update'),
    name: z.string().optional().describe('New survey name'),
    questions: z.array(z.record(z.any())).optional().describe('Replacement question list'),
    description: z.string().optional().describe('New description'),
    schedule: z.enum(['once', 'recurring', 'always']).optional().describe('New display schedule'),
    linkedFlagId: z.coerce
      .number()
      .int()
      .optional()
      .describe('New linked targeting feature flag id'),
    responsesLimit: z.coerce.number().int().optional().describe('New response cap'),
    archived: z.boolean().optional().describe('Archive or unarchive the survey'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    surveyId,
    name,
    questions,
    description,
    schedule,
    linkedFlagId,
    responsesLimit,
    archived,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!surveyId) return { error: 'surveyId is required.' };
    if (
      name === undefined &&
      questions === undefined &&
      description === undefined &&
      schedule === undefined &&
      linkedFlagId === undefined &&
      responsesLimit === undefined &&
      archived === undefined
    ) {
      return {
        error:
          'Provide at least one field to update (name, questions, description, schedule, linkedFlagId, responsesLimit, archived).',
      };
    }

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/surveys/${surveyId}/`,
      {
        method: 'PATCH',
        body: {
          name,
          questions,
          description,
          schedule,
          linked_flag_id: linkedFlagId,
          responses_limit: responsesLimit,
          archived,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogDeleteSurvey = tool({
  description:
    'Deletes a survey and its responses permanently. Confirm with the user first. Needs survey:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    surveyId: z.string().min(1).describe('Survey id to delete'),
  }),
  execute: async ({ posthogCredentials, projectId, surveyId }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!surveyId) return { error: 'surveyId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/surveys/${surveyId}/`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});

export const posthogListSurveyResponses = tool({
  description:
    'Lists a survey’s responses, paged (max 500 per call) — answers keyed by question id. Filter to one question, to rating bands (score_gte/score_lte with question_id, e.g. NPS passives), or to a submission date range. Needs survey:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    surveyId: z.string().min(1).describe('Survey id whose responses to fetch'),
    questionId: z
      .string()
      .optional()
      .describe(
        'Only responses with an answer to this question id (and only that question is returned)',
      ),
    scoreGte: z
      .number()
      .optional()
      .describe('Rating answers >= this value (requires questionId), e.g. 9 for NPS promoters'),
    scoreLte: z
      .number()
      .optional()
      .describe('Rating answers <= this value (requires questionId), e.g. 6 for NPS detractors'),
    since: z
      .string()
      .optional()
      .describe('Only responses submitted on/after this ISO 8601 timestamp'),
    until: z
      .string()
      .optional()
      .describe('Only responses submitted on/before this ISO 8601 timestamp'),
    excludeArchived: z.boolean().optional().describe('Skip responses archived via the app'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe('Rows per page, 1-500 (default 100)'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    surveyId,
    questionId,
    scoreGte,
    scoreLte,
    since,
    until,
    excludeArchived,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!surveyId) return { error: 'surveyId is required.' };
    if ((scoreGte !== undefined || scoreLte !== undefined) && !questionId) {
      return { error: 'questionId is required when using scoreGte/scoreLte.' };
    }

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/surveys/${surveyId}/responses/`,
      {
        query: {
          question_id: questionId,
          score_gte: scoreGte,
          score_lte: scoreLte,
          since,
          until,
          exclude_archived: excludeArchived,
          limit,
          offset,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogChangeSurveyStatus = tool({
  description:
    'Changes a survey’s lifecycle: launch starts collection (draft → running) so respondents see it, stop ends collection (running → complete). Needs survey:write.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    surveyId: z.string().min(1).describe('Survey id to act on'),
    action: z
      .enum(['launch', 'stop'])
      .describe('launch = start collecting responses, stop = end collection'),
  }),
  execute: async ({ posthogCredentials, projectId, surveyId, action }) => {
    if (!projectId) return { error: 'projectId is required.' };
    if (!surveyId) return { error: 'surveyId is required.' };
    if (!action) return { error: 'action is required (launch or stop).' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/surveys/${surveyId}/${action}/`,
      { method: 'POST' },
    );
    if (result.error) return result;

    return result.data ?? { status: result.status, action };
  },
});
