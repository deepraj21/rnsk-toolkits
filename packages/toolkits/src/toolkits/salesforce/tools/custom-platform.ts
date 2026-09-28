// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfPost } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceGetAllCustomObjects = tool({
  description:
    'List Salesforce objects (standard and custom) with metadata. The Global Describe call is not paginated server-side, so page/page_size slice the full list client-side; use custom_only for custom objects.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    page: z.number().int().min(1).optional().describe('Page number, 1-indexed (default 1).'),
    page_size: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe('Objects per page (default 50).'),
    custom_only: z.boolean().optional().describe('Only custom objects.'),
  }),
  execute: async ({ salesforceCredentials, page, page_size, custom_only }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const data = (await sfGet(salesforceCredentials, '/sobjects')) as {
      sobjects?: Record<string, unknown>[];
      maxBatchSize?: number;
      encoding?: string;
      error?: string;
    };
    if (data && data.error) return data;
    let objects = data.sobjects ?? [];
    if (custom_only) objects = objects.filter((o) => o.custom === true);
    const size = Math.min(Math.max(page_size || 50, 1), 200);
    const current = Math.max(page || 1, 1);
    const total = objects.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    return {
      encoding: data.encoding,
      maxBatchSize: data.maxBatchSize,
      sobjects: objects.slice((current - 1) * size, current * size),
      pagination: {
        current_page: current,
        page_size: size,
        total_count: total,
        total_pages: totalPages,
        has_next_page: current < totalPages,
        has_previous_page: current > 1,
      },
    };
  },
});

export const salesforceGetListViewMetadataBatch = tool({
  description:
    'Get metadata for multiple list views in one call by comma-separated list view Ids. Each view resolves through the UI API batch resource.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    list_view_ids: z.string().describe('Comma-separated list view Ids.'),
  }),
  execute: async ({ salesforceCredentials, list_view_ids }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const ids = String(list_view_ids)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!ids.length) return { error: 'list_view_ids must contain at least one Id.' };
    const data = (await sfPost(salesforceCredentials, '/ui-api/batch', {
      body: {
        batchRequests: ids.map((id) => ({
          method: 'GET',
          url: `/services/data/v62.0/ui-api/list-records/${id}?pageSize=1`,
        })),
      },
    })) as { results?: { statusCode: number; result: unknown }[]; error?: string };
    if (data && data.error) return data;
    return { results: data.results ?? [] };
  },
});

export const salesforceGetUserInfo = tool({
  description:
    'Get Salesforce user details: current user by default, or a specific user by Id. Optionally include profile/role/permission details.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    user_id: z.string().optional().describe('User Id (omit for the current user).'),
    include_permissions: z
      .boolean()
      .optional()
      .describe('Also fetch profile, role and permission details.'),
  }),
  execute: async ({ salesforceCredentials, user_id, include_permissions }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const me = user_id
      ? ((await sfGet(salesforceCredentials, `/sobjects/User/${user_id}`)) as Record<
          string,
          unknown
        >)
      : ((await sfGet(salesforceCredentials, '/chatter/users/me')) as Record<string, unknown>);
    if (me && (me as { error?: string }).error) return me;
    if (!include_permissions) return me;
    const id = (me.id || me.Id) as string;
    const details = (await sfGet(salesforceCredentials, `/sobjects/User/${id}`, {
      query: { fields: 'Id,Name,Username,Email,ProfileId,UserRoleId,UserType,IsActive' },
    })) as Record<string, unknown>;
    if (details && (details as { error?: string }).error)
      return { ...me, salesforce_user_details: null };
    const out: Record<string, unknown> = { ...me, salesforce_user_details: details };
    if (details.ProfileId) {
      const profile = await sfGet(salesforceCredentials, `/sobjects/Profile/${details.ProfileId}`, {
        query: { fields: 'Id,Name,UserType,PermissionsApiEnabled' },
      });
      if (!(profile && (profile as { error?: string }).error)) out.profile = profile;
    }
    return out;
  },
});

export const salesforceWhoAmI = tool({
  description:
    'Identify the connected Salesforce account: user email, name, user Id and organization Id.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const [me, org] = (await Promise.all([
      sfGet(salesforceCredentials, '/chatter/users/me'),
      sfGet(salesforceCredentials, '/query', {
        query: { q: 'SELECT Id, Name FROM Organization LIMIT 1' },
      }),
    ])) as [Record<string, unknown>, { records?: { Id: string; Name: string }[]; error?: string }];
    if (me && (me as { error?: string }).error) return me;
    if (org && org.error) return org;
    const orgRow = (org.records ?? [])[0] ?? {};
    const email = (me.email as string) ?? (me.username as string) ?? null;
    return {
      data: {
        data: {
          user_id: (me.id as string) ?? null,
          organization_id: (orgRow.Id as string) ?? null,
          email,
          name: (me.name as string) ?? (me.displayName as string) ?? null,
          preferred_username: (me.username as string) ?? null,
        },
        display_name: email ?? (me.name as string) ?? null,
      },
      successful: true,
    };
  },
});

export const salesforceSetUserPassword = tool({
  description:
    'Set a user password to a specific value, or omit new_password to reset it (invalidates the current password and emails a reset link; no password is returned).',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    user_id: z.string().describe('User Id to set or reset the password for.'),
    new_password: z
      .string()
      .optional()
      .describe('New password meeting org policies. Omit to trigger a reset email instead.'),
  }),
  execute: async ({ salesforceCredentials, user_id, new_password }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (new_password) {
      const res = await sfPost(salesforceCredentials, `/sobjects/User/${user_id}/password`, {
        body: { NewPassword: new_password },
      });
      if (res && (res as { error?: string }).error) return res;
      return { success: true, reset: false };
    }
    const res = await sfDelete(salesforceCredentials, `/sobjects/User/${user_id}/password`);
    if (res && (res as { error?: string }).error) return res;
    return { success: true, reset: true };
  },
});
