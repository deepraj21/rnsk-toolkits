// @ts-nocheck
import type { ToolDefinition } from '../../../core/types.js';
import { posthogGetUser } from './projects.js';
import { posthogListProjects } from './projects.js';
import { posthogListEvents } from './events.js';
import { posthogGetEventValues } from './events.js';
import { posthogRunQuery } from './query.js';
import { posthogGetQuery } from './query.js';
import { posthogListEventDefinitions } from './definitions.js';
import { posthogListPropertyDefinitions } from './definitions.js';
import { posthogListPersons } from './persons.js';
import { posthogUpdatePerson } from './persons.js';
import { posthogDeletePerson } from './persons.js';
import { posthogUpdatePersonProperty } from './persons.js';
import { posthogListInsights } from './insights.js';
import { posthogGetInsight } from './insights.js';
import { posthogCreateInsight } from './insights.js';
import { posthogUpdateInsight } from './insights.js';
import { posthogDeleteInsight } from './insights.js';
import { posthogListDashboards } from './dashboards.js';
import { posthogGetDashboard } from './dashboards.js';
import { posthogCreateDashboard } from './dashboards.js';
import { posthogDeleteDashboard } from './dashboards.js';
import { posthogAddDashboardInsight } from './dashboards.js';
import { posthogListFeatureFlags } from './feature-flags.js';
import { posthogCreateFeatureFlag } from './feature-flags.js';
import { posthogUpdateFeatureFlag } from './feature-flags.js';
import { posthogDeleteFeatureFlag } from './feature-flags.js';
import { posthogTestFeatureFlag } from './feature-flags.js';
import { posthogListExperiments } from './experiments.js';
import { posthogGetExperiment } from './experiments.js';
import { posthogCreateExperiment } from './experiments.js';
import { posthogDeleteExperiment } from './experiments.js';
import { posthogChangeExperimentStatus } from './experiments.js';
import { posthogListCohorts } from './cohorts.js';
import { posthogGetCohort } from './cohorts.js';
import { posthogCreateCohort } from './cohorts.js';
import { posthogDeleteCohort } from './cohorts.js';
import { posthogListCohortPersons } from './cohorts.js';
import { posthogAddCohortPersons } from './cohorts.js';
import { posthogListSurveys } from './surveys.js';
import { posthogGetSurvey } from './surveys.js';
import { posthogCreateSurvey } from './surveys.js';
import { posthogUpdateSurvey } from './surveys.js';
import { posthogDeleteSurvey } from './surveys.js';
import { posthogListSurveyResponses } from './surveys.js';
import { posthogChangeSurveyStatus } from './surveys.js';
import { posthogListSessionRecordings } from './session-recordings.js';
import { posthogGetSessionRecording } from './session-recordings.js';
import { posthogListAnnotations } from './annotations.js';
import { posthogCreateAnnotation } from './annotations.js';
import { posthogDeleteAnnotation } from './annotations.js';
import { posthogListGroupTypes } from './groups.js';
import { posthogListGroups } from './groups.js';
import { posthogGetGroup } from './groups.js';
import { posthogListActions } from './actions.js';
import { posthogGetAction } from './actions.js';
import { posthogCreateAction } from './actions.js';
import { posthogDeleteAction } from './actions.js';

export {
  posthogGetUser,
  posthogListProjects,
  posthogListEvents,
  posthogGetEventValues,
  posthogRunQuery,
  posthogGetQuery,
  posthogListEventDefinitions,
  posthogListPropertyDefinitions,
  posthogListPersons,
  posthogUpdatePerson,
  posthogDeletePerson,
  posthogUpdatePersonProperty,
  posthogListInsights,
  posthogGetInsight,
  posthogCreateInsight,
  posthogUpdateInsight,
  posthogDeleteInsight,
  posthogListDashboards,
  posthogGetDashboard,
  posthogCreateDashboard,
  posthogDeleteDashboard,
  posthogAddDashboardInsight,
  posthogListFeatureFlags,
  posthogCreateFeatureFlag,
  posthogUpdateFeatureFlag,
  posthogDeleteFeatureFlag,
  posthogTestFeatureFlag,
  posthogListExperiments,
  posthogGetExperiment,
  posthogCreateExperiment,
  posthogDeleteExperiment,
  posthogChangeExperimentStatus,
  posthogListCohorts,
  posthogGetCohort,
  posthogCreateCohort,
  posthogDeleteCohort,
  posthogListCohortPersons,
  posthogAddCohortPersons,
  posthogListSurveys,
  posthogGetSurvey,
  posthogCreateSurvey,
  posthogUpdateSurvey,
  posthogDeleteSurvey,
  posthogListSurveyResponses,
  posthogChangeSurveyStatus,
  posthogListSessionRecordings,
  posthogGetSessionRecording,
  posthogListAnnotations,
  posthogCreateAnnotation,
  posthogDeleteAnnotation,
  posthogListGroupTypes,
  posthogListGroups,
  posthogGetGroup,
  posthogListActions,
  posthogGetAction,
  posthogCreateAction,
  posthogDeleteAction,
};

export const posthogTools: ToolDefinition[] = [
  {
    name: 'posthogGetUser',
    description:
      'Gets the PostHog user account behind the connected personal API key — name, email, UUID, and the organizations and projects they belong to. Use this first to confirm which account is connected. Needs user:read.',
    tool: posthogGetUser,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'user', 'account', 'profile', 'whoami', 'me'],
  },
  {
    name: 'posthogListProjects',
    description:
      'Lists the PostHog projects the connected account can access — id, name, organization, timezone, and project settings. Run this first: use the returned id as projectId for every other PostHog tool. Needs project:read.',
    tool: posthogListProjects,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'projects', 'workspace', 'list', 'discover'],
  },
  {
    name: 'posthogListEvents',
    description:
      'Lists raw events captured in a project, newest first — filter by event name (e.g. "user sign up", "$pageview"), time range, distinct id, person id, or property filters, and optionally embed the person on each row. Use select/where for HogQL expressions. Needs query:read.',
    tool: posthogListEvents,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'events', 'activity', 'stream', 'raw', 'tracking'],
  },
  {
    name: 'posthogGetEventValues',
    description:
      'Lists the distinct values seen for an event or person property, with usage counts — use it to discover valid property values (countries, URLs, plan names) before building filters, queries, or cohorts. Needs query:read.',
    tool: posthogGetEventValues,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'event', 'values', 'property', 'distinct', 'options'],
  },
  {
    name: 'posthogRunQuery',
    description:
      'Runs an analytics query against a project. Pass a query object whose kind selects the query type: TrendsQuery, FunnelsQuery, RetentionQuery, LifecycleQuery, PathsQuery, StickinessQuery, EventsQuery (raw event rows), SessionsQuery, ActorsQuery, GroupsQuery, HogQLQuery (SQL, {"query":"SELECT ..."}), InsightVizNode, or DataTableNode. For slow queries pass async: true and poll posthogGetQuery with the returned id. Needs query:read.',
    tool: posthogRunQuery,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'query', 'sql', 'hogql', 'trends', 'funnel', 'analytics', 'run'],
  },
  {
    name: 'posthogGetQuery',
    description:
      'Gets the status and results of a query started with posthogRunQuery (async: true) by its id — returns the run state (running, done, failed) and, once done, the result rows. Also re-fetches any saved query run. Needs query:read.',
    tool: posthogGetQuery,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'query', 'status', 'poll', 'results', 'async'],
  },
  {
    name: 'posthogListEventDefinitions',
    description:
      'Lists the event taxonomy of a project — event names with descriptions, tags, verification, last-seen time, and property lists. Use it to discover which events exist before building queries, insights, or cohorts. Needs event_definition:read.',
    tool: posthogListEventDefinitions,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'event', 'definitions', 'taxonomy', 'schema', 'catalog'],
  },
  {
    name: 'posthogListPropertyDefinitions',
    description:
      'Lists the property taxonomy of a project — property names, types (String, Numeric, Boolean, DateTime), tags, and verification, scoped to event/person/group/session properties or to specific events. Use it to find valid property keys for filters and queries. Needs property_definition:read.',
    tool: posthogListPropertyDefinitions,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'property', 'definitions', 'taxonomy', 'schema', 'fields'],
  },
  {
    name: 'posthogListPersons',
    description:
      'Lists persons (users) in a project — search by email, name, person id, or distinct id, or filter by person properties. Each row includes the uuid (used for cohort membership) and distinct ids. Needs person:read.',
    tool: posthogListPersons,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'persons', 'users', 'people', 'profiles', 'search'],
  },
  {
    name: 'posthogUpdatePerson',
    description:
      'Updates a person — rename them, merge in additional distinct ids, or replace their properties object. For changing a single property without touching the rest, prefer posthogUpdatePersonProperty. Needs person:write.',
    tool: posthogUpdatePerson,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'person', 'user', 'update', 'merge', 'rename', 'edit'],
  },
  {
    name: 'posthogDeletePerson',
    description:
      'Deletes a person and all their events and properties from the project. Permanent and irreversible — confirm with the user before calling (use for GDPR/CCPA deletion requests). Needs person:write.',
    tool: posthogDeletePerson,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'person', 'user', 'delete', 'erase', 'gdpr', 'privacy'],
  },
  {
    name: 'posthogUpdatePersonProperty',
    description:
      'Sets one person property to a value without replacing their other properties — e.g. mark a user as {"key":"is_trial","value":true}. Pass value null to clear it. Needs person:write.',
    tool: posthogUpdatePersonProperty,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'person', 'property', 'trait', 'set', 'clear', 'user'],
  },
  {
    name: 'posthogListInsights',
    description:
      'Lists saved insights (charts) in a project — trends, funnels, retention, paths, lifecycle, stickiness, and SQL. Filter by text search, dashboard, insight type, tags, favorites, or date ranges; set basic: true for fast metadata-only results. Needs insight:read.',
    tool: posthogListInsights,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'insights', 'charts', 'graphs', 'saved', 'visualizations'],
  },
  {
    name: 'posthogGetInsight',
    description:
      'Gets one insight by id (numeric id or short_id) with its query definition and results. Pass refresh to recompute (e.g. "blocking" waits for fresh numbers) — use this to read a chart’s latest data. Needs insight:read.',
    tool: posthogGetInsight,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'insight', 'chart', 'graph', 'results', 'refresh'],
  },
  {
    name: 'posthogCreateInsight',
    description:
      'Creates a saved insight (chart). Pass name plus either query (new query API — e.g. {"kind":"InsightVizNode","source":{"kind":"TrendsQuery","series":[{"event":"$pageview","math":"total"}]}}) or filters (legacy trends filters); optionally attach it to dashboards by id and add tags/description. Needs insight:write.',
    tool: posthogCreateInsight,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'insight', 'create', 'chart', 'trends', 'funnel', 'save'],
  },
  {
    name: 'posthogUpdateInsight',
    description:
      'Updates an existing insight — rename it, edit its query or filters, change description/tags, reattach it to dashboards, or favorite it. Send only the fields to change. Needs insight:write.',
    tool: posthogUpdateInsight,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'insight', 'update', 'edit', 'rename', 'chart', 'favorite'],
  },
  {
    name: 'posthogDeleteInsight',
    description:
      'Deletes an insight permanently from the project (dashboards that show it lose the tile). Confirm with the user first. Needs insight:write.',
    tool: posthogDeleteInsight,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'insight', 'delete', 'remove', 'chart', 'purge'],
  },
  {
    name: 'posthogListDashboards',
    description:
      'Lists dashboards in a project — name, description, tags, pinned state, and last view time. Filter by text search, folder, creator, or pinned status. Use the returned id with the other dashboard tools. Needs dashboard:read.',
    tool: posthogListDashboards,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'dashboards', 'boards', 'overview', 'list', 'pinned'],
  },
  {
    name: 'posthogGetDashboard',
    description:
      'Gets one dashboard by id with its full definition — tiles, the insights on them, filters, variables, and layout. Use this to read what a dashboard shows or to get tile/insight ids before editing. Needs dashboard:read.',
    tool: posthogGetDashboard,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'dashboard', 'tiles', 'layout', 'definition', 'read'],
  },
  {
    name: 'posthogCreateDashboard',
    description:
      'Creates an empty dashboard — returns its id, which you pass to posthogAddDashboardInsight to attach charts. Optionally set a description, pin it, add tags, or file it in a folder. Needs dashboard:write.',
    tool: posthogCreateDashboard,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'dashboard', 'create', 'new', 'board', 'build'],
  },
  {
    name: 'posthogDeleteDashboard',
    description:
      'Deletes a dashboard permanently. The insights on it are not deleted — they remain in the insight list — but the dashboard and its layout are gone. Confirm with the user first. Needs dashboard:write.',
    tool: posthogDeleteDashboard,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'dashboard', 'delete', 'remove', 'purge'],
  },
  {
    name: 'posthogAddDashboardInsight',
    description:
      'Attaches an existing insight to a dashboard as a new tile. Pass the insight’s numeric id (the id field, not short_id) from the insight list or creation response. Needs dashboard:write.',
    tool: posthogAddDashboardInsight,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'dashboard', 'insight', 'tile', 'attach', 'add', 'widget'],
  },
  {
    name: 'posthogListFeatureFlags',
    description:
      'Lists feature flags in a project — key, name, active state, rollout filters, variants, tags, and type (boolean, experiment, multivariant, remote config). Filter by exact key, text search, active/archived state, ids, or tags. Needs feature_flag:read.',
    tool: posthogListFeatureFlags,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'feature', 'flags', 'toggle', 'rollout', 'experiments', 'list'],
  },
  {
    name: 'posthogCreateFeatureFlag',
    description:
      'Creates a feature flag. key is the flag key checked in code; filters define targeting — groups of person properties with a rollout percentage, or multivariate variants with payloads. If filters is omitted the flag defaults to 100% rollout for everyone when active. Needs feature_flag:write.',
    tool: posthogCreateFeatureFlag,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'feature', 'flag', 'create', 'rollout', 'targeting', 'toggle'],
  },
  {
    name: 'posthogUpdateFeatureFlag',
    description:
      'Updates a feature flag — rename its key, edit targeting filters/rollouts, enable or disable it (active true/false), archive or unarchive it (archived), or change tags and payloads. Send only the fields to change. Needs feature_flag:write.',
    tool: posthogUpdateFeatureFlag,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'feature', 'flag', 'update', 'enable', 'disable', 'rollout', 'edit'],
  },
  {
    name: 'posthogDeleteFeatureFlag',
    description:
      'Deletes a feature flag permanently — code checking it will start falling back to the default. Confirm with the user first; to hide it without breaking code prefer posthogUpdateFeatureFlag with archived: true. Needs feature_flag:write.',
    tool: posthogDeleteFeatureFlag,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'feature', 'flag', 'delete', 'remove', 'purge'],
  },
  {
    name: 'posthogTestFeatureFlag',
    description:
      'Evaluates a feature flag for one distinct id (or person) and returns the value/variant that user would get, with the matching rationale — use it to verify targeting before rolling out. Needs feature_flag:read.',
    tool: posthogTestFeatureFlag,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'feature', 'flag', 'test', 'evaluate', 'variant', 'preview'],
  },
  {
    name: 'posthogListExperiments',
    description:
      'Lists experiments in a project — name, status (draft, running, paused, complete), linked feature flag, and metrics. Filter by text search, status, feature flag, tags, or creator. Needs experiment:read.',
    tool: posthogListExperiments,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'experiments', 'ab', 'test', 'a/b', 'split', 'list'],
  },
  {
    name: 'posthogGetExperiment',
    description:
      'Gets one experiment by id with its full definition — variants, feature flag linkage, parameters, dates, status, and computed results. Use it to read experiment performance. Needs experiment:read.',
    tool: posthogGetExperiment,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'experiment', 'results', 'variants', 'performance', 'read'],
  },
  {
    name: 'posthogCreateExperiment',
    description:
      'Creates an experiment together with its linked feature flag — name and featureFlagKey are required. Define variants via featureFlag.filters (multivariate variants with rollout percentages) and statistical parameters via parameters like {"minimum_detectable_effect":5}. Needs experiment:write (and feature_flag:write for the flag).',
    tool: posthogCreateExperiment,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'experiment', 'create', 'ab', 'test', 'variant', 'launch'],
  },
  {
    name: 'posthogDeleteExperiment',
    description:
      'Deletes an experiment permanently; its feature flag is left behind (delete it separately if unwanted). Confirm with the user first. Needs experiment:write.',
    tool: posthogDeleteExperiment,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'experiment', 'delete', 'remove', 'purge'],
  },
  {
    name: 'posthogChangeExperimentStatus',
    description:
      'Changes an experiment’s lifecycle: launch (start collecting exposure), pause, resume, or end. When ending, optionally record a conclusion (won, lost, inconclusive, stopped_early, invalid) and a comment. Needs experiment:write.',
    tool: posthogChangeExperimentStatus,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'experiment', 'launch', 'pause', 'resume', 'end', 'status'],
  },
  {
    name: 'posthogListCohorts',
    description:
      'Lists cohorts in a project — dynamic (auto-updating) and static (fixed member list) — with their filters, member counts, and calculation status. Filter by name search, type, or creator. Needs cohort:read.',
    tool: posthogListCohorts,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'cohorts', 'segments', 'audience', 'groups', 'list'],
  },
  {
    name: 'posthogGetCohort',
    description:
      'Gets one cohort by id with its filter definition, current member count, calculation status, and last error if recalculation failed. Needs cohort:read.',
    tool: posthogGetCohort,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'cohort', 'segment', 'members', 'filters', 'read'],
  },
  {
    name: 'posthogCreateCohort',
    description:
      'Creates a cohort. For a dynamic cohort pass filters like {"properties":{"type":"OR","values":[{"key":"plan","value":"pro","operator":"exact","type":"person"}]}}; for a fixed audience set isStatic: true and add members afterwards with posthogAddCohortPersons. Needs cohort:write.',
    tool: posthogCreateCohort,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'cohort', 'create', 'segment', 'audience', 'static', 'dynamic'],
  },
  {
    name: 'posthogDeleteCohort',
    description:
      'Deletes a cohort. Feature flags, experiments, or insights referencing it will lose that segment — confirm with the user first. Needs cohort:write.',
    tool: posthogDeleteCohort,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'cohort', 'delete', 'remove', 'segment', 'purge'],
  },
  {
    name: 'posthogListCohortPersons',
    description:
      'Lists the persons currently in a cohort, paged — each row has the person uuid and properties. Use it to see who matches a segment or to collect uuids for posthogAddCohortPersons. Needs cohort:read.',
    tool: posthogListCohortPersons,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'cohort', 'persons', 'members', 'users', 'list'],
  },
  {
    name: 'posthogAddCohortPersons',
    description:
      'Adds persons to a STATIC cohort by their person UUIDs (the uuid field from posthogListPersons — not the numeric id). Dynamic cohorts update themselves from their filters and cannot take manual members. Needs cohort:write.',
    tool: posthogAddCohortPersons,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'cohort', 'add', 'members', 'persons', 'static', 'include'],
  },
  {
    name: 'posthogListSurveys',
    description:
      'Lists surveys in a project — name, type (popover, widget, external_survey, api), status (draft, running, complete), questions, and linked targeting flag. Filter by search, status, type, or feature flag. Needs survey:read.',
    tool: posthogListSurveys,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'surveys', 'polls', 'feedback', 'questionnaire', 'list'],
  },
  {
    name: 'posthogGetSurvey',
    description:
      'Gets one survey by id with its full definition — questions, branching logic, targeting flag, appearance, schedule, and status. Use it before updating a survey or interpreting its responses. Needs survey:read.',
    tool: posthogGetSurvey,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'survey', 'questions', 'definition', 'read', 'feedback'],
  },
  {
    name: 'posthogCreateSurvey',
    description:
      'Creates a survey in draft. name and type are required (popover, widget, external_survey, api); questions look like [{"id":"0","type":"open","question":"How did you hear about us?"}] with types open, link, rating, single_choice, multiple_choice, nps, email, number, date, time. Targeted surveys manage a linked feature flag, so the key needs feature_flag:write too. Needs survey:write.',
    tool: posthogCreateSurvey,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'survey', 'create', 'questions', 'feedback', 'poll', 'draft'],
  },
  {
    name: 'posthogUpdateSurvey',
    description:
      'Updates a draft or running survey — change its name, questions, description, schedule, response limit, or linked targeting flag. Send only the fields to change. Needs survey:write.',
    tool: posthogUpdateSurvey,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'survey', 'update', 'edit', 'questions', 'feedback'],
  },
  {
    name: 'posthogDeleteSurvey',
    description:
      'Deletes a survey and its responses permanently. Confirm with the user first. Needs survey:write.',
    tool: posthogDeleteSurvey,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'survey', 'delete', 'remove', 'purge', 'responses'],
  },
  {
    name: 'posthogListSurveyResponses',
    description:
      'Lists a survey’s responses, paged (max 500 per call) — answers keyed by question id. Filter to one question, to rating bands (score_gte/score_lte with question_id, e.g. NPS passives), or to a submission date range. Needs survey:read.',
    tool: posthogListSurveyResponses,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'survey', 'responses', 'answers', 'feedback', 'nps', 'results'],
  },
  {
    name: 'posthogChangeSurveyStatus',
    description:
      'Changes a survey’s lifecycle: launch starts collection (draft → running) so respondents see it, stop ends collection (running → complete). Needs survey:write.',
    tool: posthogChangeSurveyStatus,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'survey', 'launch', 'stop', 'start', 'status', 'publish'],
  },
  {
    name: 'posthogListSessionRecordings',
    description:
      'Lists session recordings (replay) in a project — duration, active time, click/keypress counts, console errors, start URL, and the person who recorded. Returns metadata only (not the raw replay stream). Needs session_recording:read.',
    tool: posthogListSessionRecordings,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'session', 'recordings', 'replay', 'watch', 'sessions', 'list'],
  },
  {
    name: 'posthogGetSessionRecording',
    description:
      'Gets one session recording by id — timing, activity metrics, console error counts, start URL, person, and viewed status. Use after posthogListSessionRecordings to inspect a specific replay. Needs session_recording:read.',
    tool: posthogGetSessionRecording,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'session', 'recording', 'replay', 'details', 'watch'],
  },
  {
    name: 'posthogListAnnotations',
    description:
      'Lists annotations — dated notes marking what changed (deploys, launches, incidents) so charts can be read in context. Filter by dashboard, insight, date range, or the type of thing they annotate. Needs annotation:read.',
    tool: posthogListAnnotations,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'annotations', 'notes', 'markers', 'deploy', 'context', 'list'],
  },
  {
    name: 'posthogCreateAnnotation',
    description:
      'Creates an annotation — a dated marker explaining a spike or drop on charts (e.g. "v2 launch", "incident"). content and dateMarker are required; scope decides whether it sits on a dashboard, project, organization, or recording. Needs annotation:write.',
    tool: posthogCreateAnnotation,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'annotation', 'create', 'note', 'marker', 'deploy', 'context'],
  },
  {
    name: 'posthogDeleteAnnotation',
    description:
      'Deletes an annotation. It disappears from every chart it annotated — confirm with the user first. Needs annotation:write.',
    tool: posthogDeleteAnnotation,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'annotation', 'delete', 'remove', 'note', 'purge'],
  },
  {
    name: 'posthogListGroupTypes',
    description:
      'Lists the group types defined for a project — e.g. organization, company, project — with their group type indexes. Run this first: the index is required by posthogListGroups and posthogGetGroup. Needs group:read.',
    tool: posthogListGroupTypes,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'group', 'types', 'organization', 'company', 'b2b', 'list'],
  },
  {
    name: 'posthogListGroups',
    description:
      'Lists the entities of one group type in a project (e.g. every organization), paged — key, group name, and properties aggregated from events. Requires the groupTypeIndex from posthogListGroupTypes. Needs group:read.',
    tool: posthogListGroups,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'groups', 'organization', 'account', 'company', 'b2b', 'list'],
  },
  {
    name: 'posthogGetGroup',
    description:
      'Gets one group by its key within a group type — aggregated properties, group stats, and the persons/events associated with it. Requires both groupKey and groupTypeIndex. Needs group:read.',
    tool: posthogGetGroup,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'group', 'organization', 'account', 'details', 'b2b'],
  },
  {
    name: 'posthogListActions',
    description:
      'Lists event actions (renamed event groups) in a project — name, definition, tags, and how many insights use them. Filter by name, definition text, tags, or usage count. Needs action:read.',
    tool: posthogListActions,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'actions', 'events', 'renamed', 'groups', 'definitions', 'list'],
  },
  {
    name: 'posthogGetAction',
    description:
      'Gets one event action by id with its full definition — the underlying events, property filters, and description. Use it before updating or when an insight references an action id. Needs action:read.',
    tool: posthogGetAction,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'read' as const,
    keywords: ['posthog', 'action', 'event', 'definition', 'filters', 'read'],
  },
  {
    name: 'posthogCreateAction',
    description:
      'Creates an event action — a named, reusable definition of events (e.g. "Completed checkout" = "checkout complete" or "checkout started"). name and steps are required; each step matches an event, optionally narrowed by property filters. Needs action:write.',
    tool: posthogCreateAction,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'write' as const,
    keywords: ['posthog', 'action', 'create', 'event', 'definition', 'group', 'steps'],
  },
  {
    name: 'posthogDeleteAction',
    description:
      'Deletes an event action. Insights that chart it will break — confirm with the user first; to change what it matches prefer editing it in the app. Needs action:write.',
    tool: posthogDeleteAction,
    requiredAuth: 'posthogCredentials' as const,
    scope: 'delete' as const,
    keywords: ['posthog', 'action', 'delete', 'remove', 'purge', 'event'],
  },
];
