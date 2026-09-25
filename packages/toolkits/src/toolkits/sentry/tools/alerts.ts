// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryCreateAnAlertForAnOrganization = tool({
  description: "Creates a workflow alert for a Sentry organization using the New Monitors and Alerts system. Use when you need to set up automated alerting for issues based on trigger conditions and filters. Note: This endpoint is currently in beta and may change.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("The name of the alert."),
    config: z.record(z.any()).describe("Configuration for the alert, typically includes 'frequency' in minutes. Valid frequency values: 0 (0 min), 5 (5 min), 10 (10 min), 30 (30 min), 60 (1 hour), 180 (3 hours), 720 (12 hours), 1440 (24 hours)."),
    enabled: z.boolean().optional().describe("Whether the alert is enabled or disabled."),
    triggers: z.record(z.any()).describe("The conditions on which the alert will trigger. Must include 'logicType' (one of 'any-short', 'all', or 'none') and 'conditions' array. Available trigger conditions: 'first_seen_event' (new issue created), 'issue_resolve"),
    environment: z.string().optional().describe("The name of the environment for the alert to evaluate in."),
    actionFilters: z.array(z.any()).describe("The filters to run before the action will fire and the action(s) to fire. Each filter has 'logicType' ('any-short', 'all', or 'none'), 'conditions' array, and 'actions' array. Conditions can filter by: level, age_compari"),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, name, config, enabled, triggers, environment, actionFilters, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/workflows/`, { body: { name: name, config: config, enabled: enabled, triggers: triggers, environment: environment, actionFilters: actionFilters } });
  },
});

export const sentryCreateOrganizationAlertRule = tool({
  description: "Creates a Sentry metric alert rule for an organization, mandating a 'critical' trigger, typically for a single project, where actions may require Sentry integrations.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("The name for the alert rule. Maximum length of 256 characters."),
    owner: z.string().optional().describe("The ID of the Sentry team or user that owns this alert rule. Can be a numeric ID or a string in the format 'team:<team_id>' or 'user:<user_id>'."),
    query: z.string().describe("An event search query to filter events for the alert. For example, to include only transactions with status code 400, use `http.status_code:400`. Use an empty string for no filter."),
    dataset: z.string().optional().describe("The Sentry dataset this query will execute on. Valid values include `events`, `transactions`, `metrics`, `sessions`, and `generic-metrics`. Defaults to `events` if not specified. Refer to Sentry's [Metric Alert Rule Type"),
    projects: z.array(z.string()).describe("A list of project slugs to filter by. For metric alerts, this list is typically limited to containing a single project slug."),
    triggers: z.array(z.any()).describe("List of trigger configurations. Each trigger must specify `label` ('critical' or 'warning'; 'critical' is mandatory), `alertThreshold` (numeric value to trigger), and `actions`. Each action specifies `type` (e.g., 'email"),
    aggregate: z.string().describe("The aggregate function used in this alert rule. Valid functions include `count`, `count_unique`, `percentage`, `avg`, `apdex`, `failure_rate`, `p50`, `p75`, `p95`, `p99`, `p100`, and `percentile`. Refer to Sentry's [Metr"),
    queryType: z.number().int().optional().describe("The type of query. If no value is provided, `queryType` defaults based on the specified `dataset`. Supported values: `0` (Error events: event.type:error), `1` (Transaction events: event.type:transaction), `2` (None: for "),
    eventTypes: z.array(z.string()).optional().describe("A list of event types this alert will relate to. Valid values are `default` (for events captured via Capture Message), `error`, and `transaction`."),
    timeWindow: z.number().int().describe("The time period in minutes to aggregate over. Supported values: `1` (1 minute), `5` (5 minutes), `10` (10 minutes), `15` (15 minutes), `30` (30 minutes), `60` (1 hour), `120` (2 hours), `240` (4 hours), `1440` (24 hours)"),
    environment: z.string().optional().describe("The name of the environment to filter by. If None or omitted, the alert rule applies to all environments."),
    monitorType: z.number().int().optional().describe("Integer representing the monitor type. This determines if the alert rule is actively monitored or monitored based on a specific activation condition. Consult Sentry documentation for specific values and their meanings."),
    thresholdType: z.number().int().describe("The comparison operator for the critical and warning thresholds. `0` for 'Above' and `1` for 'Below'. The resolved threshold uses the opposite operator. For percentage change thresholds, `0` means 'Higher than' and `1` m"),
    comparisonDelta: z.number().int().optional().describe("Optional. The time delta in minutes for the comparison period. Required when using a percentage change threshold (e.g., 'X% higher/lower compared to `comparisonDelta` minutes ago'). Cannot be used for Crash Free Session "),
    resolveThreshold: z.number().int().optional().describe("Optional. The numeric value the metric must reach to resolve an active alert. If not provided, it's automatically set based on the lowest severity trigger's `alertThreshold` and `thresholdType`. For example, if an alert "),
    activationCondition: z.number().int().optional().describe("Optional integer. Represents a trigger condition for when to start monitoring the alert rule, typically used when `monitorType` indicates conditional monitoring. Consult Sentry documentation for specific values."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to which this alert rule belongs."),
  }),
  execute: async ({ sentryToken, name, owner, query, dataset, projects, triggers, aggregate, queryType, eventTypes, timeWindow, environment, monitorType, thresholdType, comparisonDelta, resolveThreshold, activationCondition, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/alert-rules/`, { body: { name: name, owner: owner, query: query, dataset: dataset, projects: projects, triggers: triggers, aggregate: aggregate, queryType: queryType, eventTypes: eventTypes, timeWindow: timeWindow, environment: environment, monitorType: monitorType, thresholdType: thresholdType, comparisonDelta: comparisonDelta, resolveThreshold: resolveThreshold, activationCondition: activationCondition } });
  },
});

export const sentryCreateProjectRuleForAlerts = tool({
  description: "Creates a Sentry project alert rule by defining conditions, actions, and optional filters using specific JSON structures (detailed in parameter descriptions) to automate responses to event patterns for an existing organization and project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("Descriptive name for the alert rule."),
    owner: z.string().optional().describe("Owner ID (e.g., 'team:ID', 'user:ID')."),
    actions: z.array(z.any()).describe("List of action objects executed when conditions (and filters) are met. Each object must specify an ID (action type) and parameters. See examples for required JSON structures: **Send a notification to Suggested Assignees*"),
    filters: z.array(z.any()).optional().describe("Optional list of filter objects for additional criteria after conditions are met. Each object must specify an ID (filter type) and parameters. See examples for required JSON structures: **The issue is `comparison_type` t"),
    frequency: z.number().int().describe("Action performance interval in minutes (5-43200) once conditions are met."),
    conditions: z.array(z.any()).describe("List of condition objects defining rule triggers. Each object must specify an ID (condition type) and parameters. See examples for required JSON structures: **A new issue is created** json {     'id': 'sentry.rules.condi"),
    actionMatch: z.enum(["all", "any"]).describe("Logic for condition evaluation: 'all' (all conditions must match) or 'any' (any condition can match). NOTE: 'none' is deprecated and no longer supported."),
    environment: z.string().optional().describe("Sentry environment name for event filtering (e.g., 'production'). If omitted, applies to all environments."),
    filterMatch: z.enum(["all", "any", "none"]).optional().describe("Logic for filter evaluation ('all', 'any', 'none') for action execution. Required if 'filters' are specified."),
    projectIdOrSlug: z.string().describe("Unique identifier (ID or slug) of the Sentry project for the rule."),
    organizationIdOrSlug: z.string().describe("Unique identifier (ID or slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, name, owner, actions, filters, frequency, conditions, actionMatch, environment, filterMatch, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/rules/`, { body: { name: name, owner: owner, actions: actions, filters: filters, frequency: frequency, conditions: conditions, actionMatch: actionMatch, environment: environment, filterMatch: filterMatch } });
  },
});

export const sentryDeleteAnAlert = tool({
  description: "⚠️ This endpoint is currently in beta and may be subject to change. Deletes an alert. Use when you need to permanently remove an alert from an organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    workflowId: z.number().int().describe("The ID of the alert you'd like to query."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, workflowId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/workflows/${workflowId}/`, { query: {  } });
  },
});

export const sentryDeleteBulkAlerts = tool({
  description: "Bulk delete alerts for a given organization. Use when you need to delete multiple alerts at once. ⚠️ This endpoint is currently in beta and may be subject to change.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.string()).optional().describe("The ID of the alert you'd like to delete. Multiple IDs can be provided to delete multiple alerts at once."),
    query: z.string().optional().describe("An optional search query for filtering alerts to delete."),
    project: z.array(z.string()).optional().describe("The IDs of projects to filter by. '-1' means all available projects. For example: '/?project=1234&project=56789' or '/?project=-1'"),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, id, query, project, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/workflows/`, { query: { id: id, query: query, project: project } });
  },
});

export const sentryDeleteOrganizationAlertRule = tool({
  description: "Permanently deletes a metric alert rule from a Sentry organization. This action removes the specified metric alert rule, stopping all monitoring and notifications associated with it. The deletion is immediate and cannot be undone. Metric alert rules monitor aggregated metrics (like error rates, late",
  inputSchema: z.object({
    sentryToken: tokenField,
    alertRuleId: z.number().int().describe("The numeric ID of the metric alert rule to delete. This ID can be obtained from the alert rule's URL in the Sentry UI (https://sentry.io/organizations/{org}/alerts/rules/details/{alert_rule_id}/) or by listing alert rule"),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization. The organization slug is a URL-friendly name (e.g., 'my-organization'), while the ID is a numeric string. You can find this in your Sentry organization settings URL: https://sentry.io/"),
  }),
  execute: async ({ sentryToken, alertRuleId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/alert-rules/${alertRuleId}/`, { query: {  } });
  },
});

export const sentryDeleteOrgNotificationAction = tool({
  description: "Deletes a specific Spike Protection Notification Action for a Sentry organization, where `action_id` must be a valid action associated with the `organization_id_or_slug`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    actionId: z.number().int().describe("The unique numerical identifier (ID) of the notification action to be deleted."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, actionId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/notification-actions/${actionId}/`, { query: {  } });
  },
});

export const sentryDeleteProjectRule = tool({
  description: "Permanently deletes a specific issue alert rule from an existing project within an existing Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    ruleId: z.number().int().describe("The numerical ID of the specific issue alert rule that needs to be deleted from the project."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry project from which the alert rule will be deleted. Slugs are typically lowercase and hyphenated (e.g., 'my-web-project')."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization that contains the project and the alert rule to be deleted. Slugs are typically lowercase and hyphenated (e.g., 'my-sentry-org')."),
  }),
  execute: async ({ sentryToken, ruleId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/rules/${ruleId}/`, { query: {  } });
  },
});

export const sentryFetchAlerts = tool({
  description: "Retrieves a list of alerts (workflows) for a Sentry organization. Use to get alert configurations, statuses, and trigger details. ⚠️ Note: This endpoint is currently in beta and may be subject to change. It is supported by New Monitors and Alerts and may not be viewable in the UI today.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.string()).optional().describe("The ID of the alert you'd like to query. Can specify multiple IDs."),
    query: z.string().optional().describe("An optional search query for filtering alerts."),
    sortBy: z.string().optional().describe("The field to sort results by. If not specified, the results are sorted by id. Available fields are: `name`, `id`, `dateCreated`, `dateUpdated`, `connectedDetectors`, `actions`, `priorityDetector`. Prefix with `-` to sort"),
    project: z.array(z.number().int()).optional().describe("The IDs of projects to filter by. Use `[-1]` to include all available projects. For example: `[1234, 56789]` or `[-1]`."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, id, query, sortBy, project, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/workflows/`, { query: { id: id, query: query, sortBy: sortBy, project: project } });
  },
});

export const sentryFetchAnAlert = tool({
  description: "Retrieves detailed information for a specific alert workflow. Use when you need to get alert configuration, triggers, action filters, or monitoring status. This endpoint is currently in beta and supported by New Monitors and Alerts.",
  inputSchema: z.object({
    sentryToken: tokenField,
    workflowId: z.number().int().describe("The ID of the alert you'd like to query."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, workflowId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/workflows/${workflowId}/`, { query: {  } });
  },
});

export const sentryFetchOrganizationAlertRules = tool({
  description: "Retrieves a list of active metric alert rules for an existing Sentry organization, identified by its ID or slug. Note: This endpoint returns metric alert rules only. If no metric alert rules exist for the organization, the API may return a 404 response which is handled gracefully by returning an emp",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization for which alert rules are to be fetched. Slugs are typically the organization's name in lowercase, using hyphens for spaces (e.g., 'acme-corp')"),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/alert-rules/`, { query: {  } });
  },
});

export const sentryGetActivationOfAlertRuleForOrganization = tool({
  description: "DEPRECATED: Retrieves all activations for a specific metric alert rule. ⚠️ WARNING: This endpoint has been removed from Sentry as of January 2025. The AlertRuleActivations feature was never fully released and has been completely removed from the Sentry codebase (database tables dropped in migration ",
  inputSchema: z.object({
    sentryToken: tokenField,
    alertRuleId: z.number().int().describe("The numeric identifier of the metric alert rule whose activations are to be retrieved."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or slug of the Sentry organization to which the alert rule belongs."),
  }),
  execute: async ({ sentryToken, alertRuleId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/alert-rules/${alertRuleId}/activations/`, { query: {  } });
  },
});

export const sentryGetAlerts = tool({
  description: "Tool to retrieve all combined alert rules and monitors for a Sentry organization. Use when you need to get a unified view of both alert rules and cron monitors. This endpoint combines results from multiple sources into a single response.",
  inputSchema: z.object({
    sentryToken: tokenField,
    sort: z.array(z.string()).optional().describe("Sort fields for ordering results. Common values include 'incident_status', 'date_triggered', 'name'."),
    team: z.array(z.string()).optional().describe("Filter by team slugs. Use 'unassigned' to filter for rules with no team assigned."),
    expand: z.array(z.string()).optional().describe("Expand related data in the response. Can include 'latestIncident' to get latest incident details and 'lastTriggered' for last trigger timestamp."),
    organization: z.string().describe("The organization slug or ID to fetch alerts for."),
  }),
  execute: async ({ sentryToken, sort, team, expand, organization }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organization}/combined-rules/`, { query: { sort: sort, team: team, expand: expand } });
  },
});

export const sentryGetProjectRuleDetails = tool({
  description: "Retrieves detailed information for a specific issue alert rule within a Sentry project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    ruleId: z.number().int().describe("ID of the alert rule."),
    projectIdOrSlug: z.string().describe("ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, ruleId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/rules/${ruleId}/`, { query: {  } });
  },
});

export const sentryModifyOrganizationNotificationAction = tool({
  description: "Modifies an organization's notification action, specifically for `spike-protection` triggers.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projects: z.array(z.string()).describe("A list of project slugs for which this notification action will be active. For spike-protection triggers, this parameter is REQUIRED and must contain exactly one project slug. The notification action will apply only to t"),
    actionId: z.number().int().describe("The unique numerical ID of the specific notification action to be modified. You can obtain this ID from the 'view_organization_notification_actions' action or from the response when creating a notification action."),
    serviceType: z.string().describe("The service through which the notification will be sent. For spike-protection triggers, use `sentry_notification` for built-in Sentry notifications. Other supported services include `slack`, `pagerduty`, and `opsgenie` ("),
    triggerType: z.string().describe("Specifies the type of event that triggers the notification. Currently, the only supported value is `spike-protection`."),
    integrationId: z.number().int().optional().describe("The ID of the integration for the notification service. Required if `service_type` is `slack`, `pagerduty`, or `opsgenie`. Not needed for `sentry_notification` service type."),
    targetDisplay: z.string().optional().describe("A human-readable name for the notification target (e.g., a Slack channel name like '#critical-alerts' or an Opsgenie team name). This is required if `service_type` is `slack` or `opsgenie`."),
    targetIdentifier: z.string().optional().describe("The unique identifier of the notification target within the chosen service (e.g., a Slack channel ID like 'C012AB3CD' or an Opsgenie team ID). This is required if `service_type` is `slack` or `opsgenie`."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which this notification action belongs."),
  }),
  execute: async ({ sentryToken, projects, actionId, serviceType, triggerType, integrationId, targetDisplay, targetIdentifier, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/notification-actions/${actionId}/`, { body: { projects: projects, service_type: serviceType, trigger_type: triggerType, integration_id: integrationId, target_display: targetDisplay, target_identifier: targetIdentifier } });
  },
});

export const sentryMutateAnOrganizationSAlerts = tool({
  description: "Bulk enable or disable alerts for an organization. Use when you need to activate or deactivate multiple alerts at once. This endpoint is in beta and may change in the future.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.number().int()).optional().describe("The IDs of specific alerts to mutate. Provide one or more alert IDs to target specific alerts. If not provided, all matching alerts will be mutated."),
    query: z.string().optional().describe("An optional search query for filtering alerts to mutate. Use this to narrow down which alerts should be enabled or disabled."),
    enabled: z.boolean().describe("Whether to enable or disable the alerts. Set to true to enable alerts, false to disable them."),
    project: z.array(z.number().int()).optional().describe("The IDs of projects to filter by. Use -1 to include all available projects. For example: [1234, 5678] or [-1]."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, id, query, enabled, project, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/workflows/`, { body: { id: id, query: query, enabled: enabled, project: project } });
  },
});

export const sentryRetrieveAlertRuleDetails = tool({
  description: "Retrieves detailed information for a specific metric alert rule within a Sentry organization. Note: This endpoint is specifically for metric alert rules (organization-level alerts based on metrics like error count, latency, failure rate, etc.). For issue alert rules (project-level alerts triggered b",
  inputSchema: z.object({
    sentryToken: tokenField,
    alertRuleId: z.number().int().describe("The numeric ID of the metric alert rule."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, alertRuleId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/alert-rules/${alertRuleId}/`, { query: {  } });
  },
});

export const sentryRetrieveNotificationActionByOrgId = tool({
  description: "Retrieves details for a specific Spike Protection Notification Action, which defines alerts for triggered spike protection rules, within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    actionId: z.number().int().describe("The unique numerical identifier (ID) of the specific notification action to retrieve."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, actionId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/notification-actions/${actionId}/`, { query: {  } });
  },
});

export const sentryRetrieveProjectRulesByOrgAndProjectId = tool({
  description: "Retrieves a list of active issue alert rules associated with a specific project within an organization. Returns all active issue alert rules configured for the specified project, including their conditions, filters, actions, and metadata. This endpoint is useful for auditing alert configurations, ma",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the project for which to retrieve alert rules."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/rules/`, { query: {  } });
  },
});

export const sentrySubmitNotificationActionApiData = tool({
  description: "Creates a Sentry notification action for 'spike-protection' triggers, requiring `integration_id` if `service_type` is 'slack', 'pagerduty', or 'opsgenie', and `target_identifier`/`target_display` if `service_type` is 'slack' or 'opsgenie'.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projects: z.array(z.string()).optional().describe("Optional list of project slugs to scope this action; if provided, the action applies only to these projects."),
    serviceType: z.string().describe("The service for sending the notification (e.g., 'email', 'slack')."),
    triggerType: z.string().describe("Specifies the type of event that triggers the notification; currently, only 'spike-protection' is supported."),
    integrationId: z.number().int().optional().describe("ID of the pre-configured integration. Required if `service_type` is 'slack', 'pagerduty', or 'opsgenie'."),
    targetDisplay: z.string().optional().describe("Human-readable name for the notification target (e.g., Slack channel name). Required if `service_type` is 'slack' or 'opsgenie'."),
    targetIdentifier: z.string().optional().describe("Specific identifier of the notification target (e.g., Slack channel ID). Required if `service_type` is 'slack' or 'opsgenie'."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, projects, serviceType, triggerType, integrationId, targetDisplay, targetIdentifier, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/notification-actions/`, { body: { projects: projects, service_type: serviceType, trigger_type: triggerType, integration_id: integrationId, target_display: targetDisplay, target_identifier: targetIdentifier } });
  },
});

export const sentryUpdateAnAlertById = tool({
  description: "Tool to update an existing Sentry alert (workflow) by ID. Use when you need to modify alert settings like name, filters, triggers, or configuration. Note: This endpoint is in beta and supported by New Monitors and Alerts.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().optional().describe("The ID of the existing alert"),
    name: z.string().describe("The name of the alert"),
    config: z.record(z.any()).optional().describe("Typically the frequency at which the alert will fire, in minutes. Valid values: 0 (0 minutes), 5 (5 minutes), 10 (10 minutes), 30 (30 minutes), 60 (1 hour), 180 (3 hours), 720 (12 hours), 1440 (24 hours)"),
    enabled: z.boolean().optional().describe("Whether the alert is enabled or disabled"),
    triggers: z.record(z.any()).optional().describe("The conditions on which the alert will trigger. logicType can be one of: any-short, all, or none. Common trigger types include: first_seen_event, issue_resolved_trigger, reappeared_event, regression_event"),
    environment: z.string().optional().describe("The name of the environment for the alert to evaluate in"),
    workflowId: z.number().int().describe("The ID of the alert you'd like to query."),
    actionFilters: z.array(z.any()).optional().describe("The filters to run before the action will fire and the action(s) to fire. logicType can be one of: any-short, all, or none. See API documentation for full schema of conditions and actions."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, id, name, config, enabled, triggers, environment, workflowId, actionFilters, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/workflows/${workflowId}/`, { body: { id: id, name: name, config: config, enabled: enabled, triggers: triggers, environment: environment, action_filters: actionFilters } });
  },
});

export const sentryUpdateOrganizationAlertRules = tool({
  description: "Replaces an existing Sentry metric alert rule's configuration; fields not provided in the request are removed or reset. This action updates an existing metric alert rule. Note that this is a full replacement - any fields not provided will be removed or reset to defaults. Prerequisites: - The organiz",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("Descriptive name for the alert rule."),
    owner: z.string().optional().describe("Sentry actor ID (e.g., `team:123`, `user:456`) owning the rule, determining management permissions."),
    query: z.string().describe("Sentry search query to filter events/metrics. An empty string (`''`) applies no filter."),
    dataset: z.string().optional().describe("Dataset to query (`events`, `transactions`, `metrics`, `sessions`, `generic-metrics`). Affects available fields/aggregations; see Sentry's 'Metric Alert Rule Types' docs."),
    projects: z.array(z.string()).describe("List of project slugs to scope the alert rule."),
    triggers: z.array(z.any()).describe("List of trigger configurations defining alert conditions (critical/warning labels, thresholds) and notification actions (e.g., email, Slack). `critical` label is mandatory. See Sentry API docs for full action schema."),
    aggregate: z.string().describe("Aggregate function for the metric (e.g., `count`, `p95`). See Sentry's 'Metric Alert Rule Types' documentation for configurations based on dataset and query type."),
    queryType: z.number().int().optional().describe("Query type, often related to `dataset`: `0` (error events), `1` (transaction events), `2` (none). See Sentry's 'Metric Alert Rule Types' for valid combinations."),
    eventTypes: z.array(z.string()).optional().describe("Specific event types for this alert (e.g., `default`, `error`, `transaction`)."),
    timeWindow: z.number().int().describe("Time window in minutes for `aggregate` computation (1, 5, 10, 15, 30, 60, 120, 240, 1440)."),
    environment: z.string().optional().describe("Environment to filter events/metrics (e.g., 'production'). If omitted, applies to all environments."),
    monitorType: z.number().int().optional().describe("Monitoring state of the rule (e.g., continuously active or conditionally activated via `activationCondition`)."),
    alertRuleId: z.number().int().describe("Unique numeric ID of the metric alert rule to update."),
    thresholdType: z.number().int().describe("Comparison operator for thresholds: `0` for 'Above' (metric > threshold) or 'Higher than' (percentage change), `1` for 'Below' (metric < threshold) or 'Lower than'."),
    comparisonDelta: z.number().int().optional().describe("Comparison period (minutes) for percentage change thresholds (e.g., 'X% higher than Y minutes ago'). Required if `thresholdType` implies percentage change; not for 'Crash Free...' alerts."),
    resolveThreshold: z.number().int().optional().describe("Metric value for alert resolution. If unspecified, derived from lowest severity trigger. If `thresholdType` is `0` ('Above'), `resolveThreshold` must be < critical threshold to resolve when metric drops below this value;"),
    activationCondition: z.number().int().optional().describe("Optional condition for rule activation, used with certain `monitorType` values."),
    organizationIdOrSlug: z.string().describe("Unique identifier (ID or slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, name, owner, query, dataset, projects, triggers, aggregate, queryType, eventTypes, timeWindow, environment, monitorType, alertRuleId, thresholdType, comparisonDelta, resolveThreshold, activationCondition, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/alert-rules/${alertRuleId}/`, { body: { name: name, owner: owner, query: query, dataset: dataset, projects: projects, triggers: triggers, aggregate: aggregate, queryType: queryType, eventTypes: eventTypes, timeWindow: timeWindow, environment: environment, monitorType: monitorType, thresholdType: thresholdType, comparisonDelta: comparisonDelta, resolveThreshold: resolveThreshold, activationCondition: activationCondition } });
  },
});

export const sentryUpdateProjectRuleById = tool({
  description: "Updates an existing Sentry project issue alert rule by `rule_id`, completely overwriting it; all rule fields must be provided in the request, as omitted fields may be cleared or reset to defaults.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("The new name for the alert rule."),
    owner: z.string().optional().describe("The ID of the team or user that owns this rule. Format: `team:TEAM_ID` or `user:USER_ID` or the user's email, or a team name prefixed with '#'. For example, 'user@example.com' or '#platform-team'."),
    actions: z.array(z.any()).describe("Actions performed when rule conditions and filters are met. Structure varies by action type chosen; refer to Sentry's issue alert rule documentation."),
    filters: z.array(z.any()).optional().describe("Optional filters refining when the rule fires after conditions are met. Structure varies by filter type chosen; refer to Sentry's issue alert rule documentation."),
    ruleId: z.number().int().describe("The numeric ID of the alert rule to be updated."),
    frequency: z.number().int().describe("The minimum interval, in minutes, between actions for the same issue. Valid range is `5` to `43200` (30 days)."),
    conditions: z.array(z.any()).describe("Conditions that trigger the rule. Structure varies by condition type chosen; refer to Sentry's issue alert rule documentation."),
    actionMatch: z.enum(["all", "any"]).describe("Specifies how conditions must align for actions: 'all' (all true), 'any' (at least one true), or 'none' (all false)."),
    environment: z.string().optional().describe("Specific environment for this rule (e.g., 'production'); applies to all environments if omitted."),
    filterMatch: z.enum(["all", "any", "none"]).optional().describe("Specifies how filters (if any) must align for actions: 'all' (all true), 'any' (at least one true), or 'none' (all false)."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, name, owner, actions, filters, ruleId, frequency, conditions, actionMatch, environment, filterMatch, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/rules/${ruleId}/`, { body: { name: name, owner: owner, actions: actions, filters: filters, frequency: frequency, conditions: conditions, actionMatch: actionMatch, environment: environment, filterMatch: filterMatch } });
  },
});

export const sentryViewOrganizationNotificationActions = tool({
  description: "Retrieves Spike Protection notification actions for a Sentry organization, filterable by project IDs or slugs (slugs take precedence); if `triggerType` is used, it must be 'spike-protection'.",
  inputSchema: z.object({
    sentryToken: tokenField,
    project: z.array(z.number().int()).optional().describe("List of project IDs to filter notification actions. Use `[-1]` for all projects. `project_id_or_slug` takes precedence if also provided."),
    triggerType: z.string().optional().describe("Filters actions by trigger type. Currently, only 'spike-protection' is supported."),
    projectIdOrSlug: z.array(z.string()).optional().describe("List of project slugs to filter notification actions. Use `['$all']` for all projects. Takes precedence over `project` if also specified."),
    organizationIdOrSlug: z.string().describe("The unique ID or slug of the Sentry organization for which to view notification actions."),
  }),
  execute: async ({ sentryToken, project, triggerType, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/notification-actions/`, { query: { project: project, triggerType: triggerType, project_id_or_slug: projectIdOrSlug } });
  },
});
