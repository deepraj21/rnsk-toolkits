// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateSpace = tool({
  description: "Creates a new ClickUp Space within a specified Workspace, allowing feature configuration which defaults to Workspace settings if unspecified.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("Name for the new Space."),
    teamId: z.string().describe("Numeric ID of the Workspace (Team) for the new Space."),
    multipleAssignees: z.boolean().describe("Enable/disable multiple assignees for tasks in this Space."),
    featuresTagsEnabled: z.boolean().optional().describe("Enable/disable Tags. Defaults to Workspace setting if `None`."),
    featuresChecklistsEnabled: z.boolean().optional().describe("Enable/disable Checklists. Defaults to Workspace setting if `None`."),
    featuresDueDatesEnabled: z.boolean().optional().describe("Enable/disable Due Dates. Defaults to Workspace setting if `None`."),
    featuresPortfoliosEnabled: z.boolean().optional().describe("Enable/disable Portfolios. Defaults to Workspace setting if `None`."),
    featuresCustomFieldsEnabled: z.boolean().optional().describe("Enable/disable Custom Fields. Defaults to Workspace setting if `None`."),
    featuresDueDatesStartDate: z.boolean().optional().describe("Enable/disable Start Date for Due Dates (if Due Dates enabled). Defaults to Workspace setting if `None`."),
    featuresTimeTrackingEnabled: z.boolean().optional().describe("Enable/disable Time Tracking. Defaults to Workspace setting if `None`."),
    featuresTimeEstimatesEnabled: z.boolean().optional().describe("Enable/disable Time Estimates. Defaults to Workspace setting if `None`."),
    featuresDependencyWarningEnabled: z.boolean().optional().describe("Enable/disable Dependency Warning (shows conflict warnings). Defaults to Workspace setting if `None`."),
    featuresRemapDependenciesEnabled: z.boolean().optional().describe("Enable/disable Remap Dependencies (auto-adjusts task dates). Defaults to Workspace setting if `None`."),
    featuresDueDatesRemapDueDates: z.boolean().optional().describe("Enable/disable subtask due date remapping (if Due Dates enabled). Defaults to Workspace setting if `None`."),
    featuresDueDatesRemapClosedDueDate: z.boolean().optional().describe("Enable/disable closed subtask due date remapping (if Due Dates & subtask remapping enabled). Defaults to Workspace setting if `None`."),
  }),
  execute: async ({ clickupToken, name, teamId, multipleAssignees, featuresTagsEnabled, featuresChecklistsEnabled, featuresDueDatesEnabled, featuresPortfoliosEnabled, featuresCustomFieldsEnabled, featuresDueDatesStartDate, featuresTimeTrackingEnabled, featuresTimeEstimatesEnabled, featuresDependencyWarningEnabled, featuresRemapDependenciesEnabled, featuresDueDatesRemapDueDates, featuresDueDatesRemapClosedDueDate }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/team/${teamId}/space`, { body: nest({ name: name, multiple_assignees: multipleAssignees, features__tags__enabled: featuresTagsEnabled, features__checklists__enabled: featuresChecklistsEnabled, features__due__dates__enabled: featuresDueDatesEnabled, features__portfolios__enabled: featuresPortfoliosEnabled, features__custom__fields__enabled: featuresCustomFieldsEnabled, features__due__dates__start__date: featuresDueDatesStartDate, features__time__tracking__enabled: featuresTimeTrackingEnabled, features__time__estimates__enabled: featuresTimeEstimatesEnabled, features__dependency__warning__enabled: featuresDependencyWarningEnabled, features__remap__dependencies__enabled: featuresRemapDependenciesEnabled, features__due__dates__remap__due__dates: featuresDueDatesRemapDueDates, features__due__dates__remap__closed__due__date: featuresDueDatesRemapClosedDueDate }) });
  },
});

export const clickupCreateSpaceTag = tool({
  description: "Creates a new tag (name, foreground color, background color) in an existing ClickUp Space.",
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z.string().describe("Numeric ID of the Space to create the tag in."),
    tagName: z.string().describe("Name for the new tag. This parameter maps to the nested `tag.name` field in the API request."),
    tagTagBg: z.string().describe("Hexadecimal background color for the tag. This parameter maps to the nested `tag.tag_bg` field in the API request."),
    tagTagFg: z.string().describe("Hexadecimal foreground (text) color for the tag. This parameter maps to the nested `tag.tag_fg` field in the API request."),
  }),
  execute: async ({ clickupToken, spaceId, tagName, tagTagBg, tagTagFg }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/space/${spaceId}/tag`, { body: nest({ tag__name: tagName, tag__tag_bg: tagTagBg, tag__tag_fg: tagTagFg }) });
  },
});

export const clickupDeleteSpace = tool({
  description: "Permanently deletes a specified Space in ClickUp; this action is irreversible as the Space cannot be recovered via the API.",
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z.string().describe("Unique numerical ID of the Space to be deleted."),
  }),
  execute: async ({ clickupToken, spaceId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/space/${spaceId}`);
  },
});

export const clickupDeleteSpaceTag = tool({
  description: "Deletes a Tag from a Space, identified by `tag_name` in path; precise matching of Tag details in the request body (`tag_name_1`, `tag_tag_fg`, `tag_tag_bg`) is generally required for successful deletion.",
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z.string().describe("Numeric identifier of the Space from which the Tag will be deleted."),
    tagName: z.string().describe("Name of the Tag to be deleted, used in the URL path to identify it."),
  }),
  execute: async ({ clickupToken, spaceId, tagName }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/space/${spaceId}/tag/${tagName}`);
  },
});

export const clickupGetSpace = tool({
  description: "Retrieves detailed information for an existing Space in a ClickUp Workspace, identified by its unique space_id.",
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z.string().describe("Unique ID of the Space to retrieve."),
  }),
  execute: async ({ clickupToken, spaceId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/space/${spaceId}`);
  },
});

export const clickupGetSpaces = tool({
  description: "Retrieves Spaces for a Team ID; member information for private Spaces is returned only if the authenticated user is a member.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("Identifier for the Team (Workspace). Obtain valid workspace IDs using the GET /team endpoint."),
    archived: z.boolean().optional().describe("Filter by archived status (`true` for archived, `false` for active); API default if omitted."),
  }),
  execute: async ({ clickupToken, teamId, archived }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/space`, { query: { archived: archived } });
  },
});

export const clickupGetSpaceTags = tool({
  description: "Retrieves all tags for tasks within a specified ClickUp Space, requiring a valid `space_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z.string().describe("The unique numerical identifier of the Space for which tags are to be retrieved."),
  }),
  execute: async ({ clickupToken, spaceId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/space/${spaceId}/tag`);
  },
});

export const clickupUpdateSpace = tool({
  description: "Updates an existing ClickUp Space, allowing modification of its name, color, privacy, and feature settings (ClickApps).",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("The new name for the Space."),
    color: z.string().describe("The new color for the Space, in hexadecimal format."),
    isPrivate: z.boolean().describe("Whether the Space should be private."),
    spaceId: z.string().describe("The ID of the Space to update."),
    adminCanManage: z.boolean().optional().describe("Whether admins can manage this private Space. This is an Enterprise Plan feature. Must be omitted for non-Enterprise workspaces."),
    multipleAssignees: z.boolean().describe("Whether tasks in this Space can have multiple assignees."),
    featuresTagsEnabled: z.boolean().optional().describe("Enable or disable the Tags ClickApp. When any feature parameter is provided, all feature keys must be included (due_dates, time_estimates, time_tracking, remap_dependencies, custom_fields, dependency_warning, tags, checklists, portfolios)."),
    featuresDueDatesEnabled: z.boolean().optional().describe("Enable or disable the Due Dates ClickApp."),
    featuresChecklistsEnabled: z.boolean().optional().describe("Enable or disable the Checklists ClickApp."),
    featuresPortfoliosEnabled: z.boolean().optional().describe("Enable or disable the Portfolios ClickApp."),
    featuresDueDatesStartDate: z.boolean().optional().describe("Enable or disable Start Dates for the Due Dates ClickApp."),
    featuresCustomFieldsEnabled: z.boolean().optional().describe("Enable or disable the Custom Fields ClickApp."),
    featuresTimeTrackingEnabled: z.boolean().optional().describe("Enable or disable the Time Tracking ClickApp."),
    featuresTimeEstimatesEnabled: z.boolean().optional().describe("Enable or disable the Time Estimates ClickApp."),
    featuresDueDatesRemapDueDates: z.boolean().optional().describe("Enable or disable remapping of due dates for the Due Dates ClickApp."),
    featuresDependencyWarningEnabled: z.boolean().optional().describe("Enable or disable Dependency Warning for the Task Dependencies ClickApp."),
    featuresRemapDependenciesEnabled: z.boolean().optional().describe("Enable or disable Remap Dependencies for the Task Dependencies ClickApp."),
    featuresDueDatesRemapClosedDueDate: z.boolean().optional().describe("Enable or disable remapping of closed due dates for the Due Dates ClickApp."),
  }),
  execute: async ({ clickupToken, name, color, isPrivate, spaceId, adminCanManage, multipleAssignees, featuresTagsEnabled, featuresDueDatesEnabled, featuresChecklistsEnabled, featuresPortfoliosEnabled, featuresDueDatesStartDate, featuresCustomFieldsEnabled, featuresTimeTrackingEnabled, featuresTimeEstimatesEnabled, featuresDueDatesRemapDueDates, featuresDependencyWarningEnabled, featuresRemapDependenciesEnabled, featuresDueDatesRemapClosedDueDate }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/space/${spaceId}`, { body: nest({ name: name, color: color, private: isPrivate, admin_can_manage: adminCanManage, multiple_assignees: multipleAssignees, features__tags__enabled: featuresTagsEnabled, features__due_dates__enabled: featuresDueDatesEnabled, features__checklists__enabled: featuresChecklistsEnabled, features__portfolios__enabled: featuresPortfoliosEnabled, features__due_dates__start_date: featuresDueDatesStartDate, features__custom_fields__enabled: featuresCustomFieldsEnabled, features__time_tracking__enabled: featuresTimeTrackingEnabled, features__time_estimates__enabled: featuresTimeEstimatesEnabled, features__due_dates__remap_due_dates: featuresDueDatesRemapDueDates, features__dependency_warning__enabled: featuresDependencyWarningEnabled, features__remap_dependencies__enabled: featuresRemapDependenciesEnabled, features__due_dates__remap_closed_due_date: featuresDueDatesRemapClosedDueDate }) });
  },
});

export const clickupUpdateSpaceTag = tool({
  description: "Updates an existing tag's name and colors in a ClickUp Space; requires current tag name for identification, and new values for tag name, foreground color, and background color, all of which are mandatory for the update.",
  inputSchema: z.object({
    clickupToken: tokenField,
    spaceId: z.string().describe("Unique identifier of the Space containing the tag."),
    tagName: z.string().describe("Current name of the tag to edit. This tag must exist within the specified Space."),
    newName: z.string().optional().describe("New name to assign to the tag."),
    newTagBg: z.string().optional().describe("New background color for the tag, specified as a hexadecimal string (e.g., '#000000')."),
    newTagFg: z.string().optional().describe("New foreground color for the tag, specified as a hexadecimal string (e.g., '#FFFFFF')."),
  }),
  execute: async ({ clickupToken, spaceId, tagName, newName, newTagBg, newTagFg }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/space/${spaceId}/tag/${tagName}`, { body: nest({ tag__name: newName, tag__bg__color: newTagBg, tag__fg__color: newTagFg }) });
  },
});

