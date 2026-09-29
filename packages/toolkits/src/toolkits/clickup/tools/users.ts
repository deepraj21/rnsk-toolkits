// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupAddGuestToFolder = tool({
  description: "Adds a guest to a folder with specified permissions; requires a ClickUp Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    guestId: z.string().describe("The unique identifier of the guest user to be added to the folder."),
    folderId: z.string().describe("The unique identifier of the folder to which the guest will be added."),
    includeShared: z.boolean().optional().describe("If `true`, include shared item details (API default if parameter is omitted); if `false`, exclude them."),
    permissionLevel: z.string().describe("Permission level for the guest. Options are 'read' (view only), 'comment', 'edit', or 'create' (full access)."),
  }),
  execute: async ({ clickupToken, guestId, folderId, includeShared, permissionLevel }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/folder/${folderId}/guest/${guestId}`, { body: nest({ permission_level: permissionLevel }), query: { include_shared: includeShared } });
  },
});

export const clickupAddGuestToList = tool({
  description: "Shares a ClickUp List with an existing guest user, granting them specified permissions; requires the Workspace to be on the ClickUp Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z.string().describe("The unique identifier of the List to which the guest will be added."),
    guestId: z.string().describe("The unique identifier of the guest user to be added to the List."),
    includeShared: z.boolean().optional().describe("A boolean indicating whether to include details of items shared with the guest in the response. Set to `false` to exclude these details. If not provided or set to `true` (the API default), shared item details are included."),
    permissionLevel: z.string().describe("The permission level to be granted to the guest on this List. Accepted values are: `read` (view-only), `comment` (can add comments), `edit` (can edit existing items), or `create` (full access, including creating new items)."),
  }),
  execute: async ({ clickupToken, listId, guestId, includeShared, permissionLevel }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/list/${listId}/guest/${guestId}`, { body: nest({ permission_level: permissionLevel }), query: { include_shared: includeShared } });
  },
});

export const clickupAddGuestToTask = tool({
  description: "Assigns a guest to a task with specified permissions; requires ClickUp Enterprise Plan, and `team_id` if `custom_task_ids` is true.",
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z.string().describe("The unique identifier of the task to which the guest will be added."),
    teamId: z.string().optional().describe("Required if `custom_task_ids` is `true` to correctly identify the task when using a custom task ID."),
    guestId: z.string().describe("The unique identifier of the guest user to be added to the task."),
    includeShared: z.boolean().optional().describe("Optional. If set to `false`, details of items already shared with the guest will be excluded. The API defaults to `true` if this parameter is not explicitly set to `false`."),
    customTaskIds: z.boolean().optional().describe("Optional. Set to `true` if you are referencing the task by its custom task ID. If `true`, `team_id` must also be provided."),
    permissionLevel: z.string().describe("Permission level for the guest on this task. Must be one of: `read` (view only), `comment` (view and comment), `edit` (view, comment, and edit), or `create` (full permissions)."),
  }),
  execute: async ({ clickupToken, taskId, teamId, guestId, includeShared, customTaskIds, permissionLevel }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/task/${taskId}/guest/${guestId}`, { body: nest({ permission_level: permissionLevel }), query: { team_id: teamId, include_shared: includeShared, custom_task_ids: customTaskIds } });
  },
});

export const clickupAuthorizationGetWorkSpaceList = tool({
  description: "DEPRECATED: Use `get_authorized_teams_workspaces` instead to retrieve Workspaces (Teams) accessible to the authenticated user.",
  inputSchema: z.object({
    clickupToken: tokenField,
  }),
  execute: async ({ clickupToken }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team`);
  },
});

export const clickupCreateTeam = tool({
  description: "Creates a new team (user group) with specified members in a Workspace; member IDs must be for existing users, and be aware that adding view-only guests as paid members may incur extra charges.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe("Name for the new team (user group)."),
    members: z.array(z.number().int()).describe("User IDs to be initial members of the new team (user group)."),
    teamId: z.string().describe("Workspace ID where the team (user group) will be created (this is referred to as 'Team ID' in the ClickUp API)."),
  }),
  execute: async ({ clickupToken, name, members, teamId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/team/${teamId}/group`, { body: nest({ name: name, members: members }) });
  },
});

export const clickupDeleteTeam = tool({
  description: "Permanently deletes an existing Team (user group) from the Workspace using its `group_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    groupId: z.string().describe("The unique string identifier for the Team (user group) to be deleted."),
  }),
  execute: async ({ clickupToken, groupId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/group/${groupId}`);
  },
});

export const clickupGetAuthorizedTeamsWorkspaces = tool({
  description: "Retrieves a list of Workspaces (Teams) the authenticated user can access.",
  inputSchema: z.object({
    clickupToken: tokenField,
  }),
  execute: async ({ clickupToken }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team`);
  },
});

export const clickupGetAuthorizedUser = tool({
  description: "Retrieves the details of the currently authenticated ClickUp user.",
  inputSchema: z.object({
    clickupToken: tokenField,
  }),
  execute: async ({ clickupToken }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/user`);
  },
});

export const clickupGetCustomRoles = tool({
  description: "Retrieves all Custom Roles, which allow granular permission configurations, for a specified Workspace (Team).",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("The unique identifier of the Workspace (Team) for which to retrieve custom roles."),
    includeMembers: z.boolean().optional().describe("If true, includes members assigned to each custom role in the response."),
  }),
  execute: async ({ clickupToken, teamId, includeMembers }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/customroles`, { query: { include_members: includeMembers } });
  },
});

export const clickupGetGuest = tool({
  description: "Call this to retrieve detailed information for a specific guest within a Team (Workspace), ensuring the `guest_id` is valid for the given `team_id`; this action requires the ClickUp Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("The unique identifier for the Team (Workspace) to which the guest belongs."),
    guestId: z.string().describe("The unique identifier for the guest whose information is to be retrieved."),
  }),
  execute: async ({ clickupToken, teamId, guestId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/guest/${guestId}`);
  },
});

export const clickupGetSharedHierarchy = tool({
  description: "Retrieves the hierarchy of tasks, Lists, and Folders shared with the authenticated user within an existing ClickUp Team (Workspace), identified by its `team_id`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("Unique numerical ID of the ClickUp Team (Workspace) for which to fetch the shared hierarchy."),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/shared`);
  },
});

export const clickupGetTeams = tool({
  description: "Retrieves user groups (Teams) from a ClickUp Workspace, typically requiring `team_id` (Workspace ID), with an option to filter by `group_ids`.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.number().int().describe("ID of the ClickUp Workspace (Team ID) from which to retrieve user groups. Must be a positive integer greater than 0. Use the CLICKUP_AUTHORIZATION_GET_WORK_SPACE_LIST action to retrieve available workspace IDs."),
    groupIds: z.string().optional().describe("Comma-separated string of user group IDs to filter results; if omitted, all user groups in the Workspace are returned."),
  }),
  execute: async ({ clickupToken, teamId, groupIds }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/group`, { query: { team_id: teamId, group_ids: groupIds } });
  },
});

export const clickupGetUser = tool({
  description: "Retrieves detailed information for a specific user within a ClickUp Workspace (Team), available only for Workspaces on the ClickUp Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("ID of the Team (Workspace) containing the user."),
    userId: z.string().describe("ID of the user whose details are to be retrieved."),
  }),
  execute: async ({ clickupToken, teamId, userId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/user/${userId}`);
  },
});

export const clickupGetWorkspacePlan = tool({
  description: "Retrieves the details of the current subscription plan for a specified ClickUp Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("The unique identifier for the Workspace (formerly known as Team)."),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/plan`);
  },
});

export const clickupGetWorkspaceSeats = tool({
  description: "Retrieves seat utilization (used, total, available for members/guests) for a ClickUp Workspace (Team) ID, which must be for an existing Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("Numeric ID of the Workspace (Team)."),
  }),
  execute: async ({ clickupToken, teamId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuGet(clickupToken, V2, `/team/${teamId}/seats`);
  },
});

export const clickupInviteGuestToWorkspace = tool({
  description: "Invites a guest by email to a ClickUp Workspace (Team) on an Enterprise Plan, setting initial permissions and optionally a custom role; further access configuration for specific items may require separate actions.",
  inputSchema: z.object({
    clickupToken: tokenField,
    email: z.string().describe("Email address of the guest to invite to the Workspace."),
    teamId: z.string().describe("Unique identifier for the Workspace (Team) to which the guest will be invited."),
    canEditTags: z.boolean().describe("If `true`, the guest has permission to edit tags."),
    customRoleId: z.number().int().optional().describe("Optional ID of a custom role to assign to the guest, for granular permission control beyond default guest permissions. Only available on Business Plus Plan (one custom role) or Enterprise Plan (unlimited custom roles)."),
    canCreateViews: z.boolean().describe("If `true`, the guest has permission to create views."),
    canSeeTimeSpent: z.boolean().describe("If `true`, the guest has permission to see time spent on tasks."),
    canSeeTimeEstimated: z.boolean().describe("If `true`, the guest has permission to see time estimated for tasks."),
  }),
  execute: async ({ clickupToken, email, teamId, canEditTags, customRoleId, canCreateViews, canSeeTimeSpent, canSeeTimeEstimated }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/team/${teamId}/guest`, { body: nest({ email: email, can_edit_tags: canEditTags, custom_role_id: customRoleId, can_create_views: canCreateViews, can_see_time_spent: canSeeTimeSpent, can_see_time_estimated: canSeeTimeEstimated }) });
  },
});

export const clickupInviteUserToWorkspace = tool({
  description: "Invites a user via email to a ClickUp Workspace (Team), optionally granting admin rights or a custom role; requires an Enterprise Plan for the Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    admin: z.boolean().describe("Grant administrative privileges to the invited user."),
    email: z.string().describe("Email address of the user to invite."),
    teamId: z.string().describe("Unique identifier of the Workspace (Team) to which the user will be invited."),
    customRoleId: z.number().int().optional().describe("Optional custom role ID to assign; if omitted and custom roles are enabled, the default member role is used."),
  }),
  execute: async ({ clickupToken, admin, email, teamId, customRoleId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPost(clickupToken, V2, `/team/${teamId}/user`, { body: nest({ admin: admin, email: email, custom_role_id: customRoleId }) });
  },
});

export const clickupRemoveGuestFromFolder = tool({
  description: "Revokes a guest's access to a specific ClickUp Folder, optionally unsharing items explicitly shared with them within it; requires an Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    guestId: z.string().describe("Unique identifier of the guest to remove from the Folder."),
    folderId: z.string().describe("Unique identifier of the Folder from which to remove the guest."),
    includeShared: z.boolean().optional().describe("If `true`, items explicitly shared with the guest within this Folder are also unshared."),
  }),
  execute: async ({ clickupToken, guestId, folderId, includeShared }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/folder/${folderId}/guest/${guestId}`, { query: { include_shared: includeShared } });
  },
});

export const clickupRemoveGuestFromList = tool({
  description: "Revokes a guest's access to a specific List, provided the guest currently has access to this List and the Workspace is on the ClickUp Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    listId: z.string().describe("The unique identifier of the List from which the guest will be removed."),
    guestId: z.string().describe("The unique identifier of the guest to be removed from the List."),
    includeShared: z.boolean().optional().describe("If `false`, may alter how items shared with the guest are handled or reported during removal."),
  }),
  execute: async ({ clickupToken, listId, guestId, includeShared }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/list/${listId}/guest/${guestId}`, { query: { include_shared: includeShared } });
  },
});

export const clickupRemoveGuestFromTask = tool({
  description: "Revokes a guest's access to a specific task; only available for Workspaces on the ClickUp Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    taskId: z.string().describe("The ID of the task from which the guest will be removed. This can be the standard task ID or a custom task ID if `custom_task_ids` is set to `true`."),
    teamId: z.string().optional().describe("The ID of the team. This is required only when `custom_task_ids` is set to `true` and you are using a custom task ID. For example: `custom_task_ids=true&team_id=123`."),
    guestId: z.string().describe("The numeric ID of the guest to be removed from the task."),
    includeShared: z.boolean().optional().describe("Determines whether to include details of items shared with the guest. Set to `false` to exclude these details. Defaults to `true`."),
    customTaskIds: z.boolean().optional().describe("Set to `true` if you are using a custom task ID for the `task_id` parameter. If `true`, `team_id` must also be provided."),
  }),
  execute: async ({ clickupToken, taskId, teamId, guestId, includeShared, customTaskIds }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/task/${taskId}/guest/${guestId}`, { query: { team_id: teamId, include_shared: includeShared, custom_task_ids: customTaskIds } });
  },
});

export const clickupRemoveGuestFromWorkspace = tool({
  description: "Permanently removes a guest from a specified Workspace, revoking all their access; this destructive operation requires the Workspace to be on the ClickUp Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("Unique numerical identifier for the Workspace (often referred to as 'Team' in the ClickUp API) from which the guest is to be removed. This ID specifies the scope of the removal operation."),
    guestId: z.string().describe("Unique numerical identifier for the guest user whose access to the specified Workspace will be revoked. This ID targets the specific guest for removal."),
  }),
  execute: async ({ clickupToken, teamId, guestId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/team/${teamId}/guest/${guestId}`);
  },
});

export const clickupRemoveUserFromWorkspace = tool({
  description: "Deactivates a user from a specified ClickUp Workspace, revoking their access (user can be reactivated later); requires the Workspace to be on an Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("The unique numeric identifier of the Workspace (Team) from which the user will be deactivated."),
    userId: z.string().describe("The unique numeric identifier of the user to be deactivated from the Workspace."),
  }),
  execute: async ({ clickupToken, teamId, userId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuDelete(clickupToken, V2, `/team/${teamId}/user/${userId}`);
  },
});

export const clickupUpdateGuestOnWorkspace = tool({
  description: "Modifies the details and permissions of an existing guest user within a specific Workspace.",
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z.string().describe("The unique identifier of the Workspace (Team) where the guest belongs. Example: 123456."),
    guestId: z.string().describe("The unique identifier of the guest user to be edited. Example: 98765."),
    username: z.string().optional().describe("The new username to assign to the guest. Optional - only include if you want to change the guest's username."),
    canEditTags: z.boolean().optional().describe("Boolean flag to allow or disallow the guest to edit tags. Optional - only include if you want to change this permission."),
    customRoleId: z.number().int().optional().describe("Identifier of a custom role for the guest. Ensure this ID is valid within the workspace. Optional - only include if you want to assign/change the custom role. (Note: Business Plus Plan supports one custom role; Enterprise Plan supports unli"),
    canCreateViews: z.boolean().optional().describe("Boolean flag to allow or disallow the guest to create views. Optional - only include if you want to change this permission."),
    canSeeTimeSpent: z.boolean().optional().describe("Boolean flag to allow or disallow the guest to see time spent on tasks. Optional - only include if you want to change this permission."),
    canSeeTimeEstimated: z.boolean().optional().describe("Boolean flag to allow or disallow the guest to see time estimated for tasks. Optional - only include if you want to change this permission."),
  }),
  execute: async ({ clickupToken, teamId, guestId, username, canEditTags, customRoleId, canCreateViews, canSeeTimeSpent, canSeeTimeEstimated }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/team/${teamId}/guest/${guestId}`, { body: nest({ username: username, can_edit_tags: canEditTags, custom_role_id: customRoleId, can_create_views: canCreateViews, can_see_time_spent: canSeeTimeSpent, can_see_time_estimated: canSeeTimeEstimated }) });
  },
});

export const clickupUpdateTeam = tool({
  description: "Updates an existing ClickUp User Group (Team) using its `group_id`; note that adding a view-only guest as a paid member may incur charges.",
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().optional().describe("The new name for the User Group (Team)."),
    handle: z.string().optional().describe("The new handle for the User Group (Team), used for @mentions (e.g., '@developers')."),
    groupId: z.string().describe("The ID of the User Group (Team) to update."),
    membersAdd: z.array(z.number().int()).optional().describe("A list of user IDs to add to the User Group (Team)."),
    membersRem: z.array(z.number().int()).optional().describe("A list of user IDs to remove from the User Group (Team)."),
  }),
  execute: async ({ clickupToken, name, handle, groupId, membersAdd, membersRem }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/group/${groupId}`, { body: nest({ name: name, handle: handle, members__add: membersAdd, members__rem: membersRem }) });
  },
});

export const clickupUpdateUserOnWorkspace = tool({
  description: "Updates a user's username, admin status, or custom role in a Workspace; requires the Workspace to be on an Enterprise Plan.",
  inputSchema: z.object({
    clickupToken: tokenField,
    admin: z.boolean().optional().describe("Set `true` to make user an admin, `false` to revoke admin privileges. Optional - only include if you want to change admin status."),
    teamId: z.string().describe("Workspace (formerly Team) ID where the user resides."),
    userId: z.string().describe("ID of the user whose details are to be edited."),
    username: z.string().optional().describe("New username to assign. Optional - only include if you want to change the username."),
    customRoleId: z.number().int().optional().describe("ID of the custom role to assign, defining their permissions. Optional - only include if you want to change the custom role."),
  }),
  execute: async ({ clickupToken, admin, teamId, userId, username, customRoleId }) => {
    if (!clickupToken) return { error: "ClickUp token is required. Connect ClickUp first." };
    return cuPut(clickupToken, V2, `/team/${teamId}/user/${userId}`, { body: nest({ admin: admin, username: username, custom_role_id: customRoleId }) });
  },
});

