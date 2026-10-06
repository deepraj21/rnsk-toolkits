// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');

export const pagerdutyListStatusPages = tool({
  description: 'List status pages for external stakeholder communication.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/status_pages'),
});

export const pagerdutyGetStatusPageImpacts = tool({
  description: 'Current incident impacts shown on a status page.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/status_pages/${encodeURIComponent(statusPageId)}/impacts`),
});

export const pagerdutyGetStatusPageImpact = tool({
  description: 'Details of one impact entry on a status page.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    impactId: z.string().describe('Impact ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, impactId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_pages/${encodeURIComponent(statusPageId)}/impacts/${encodeURIComponent(impactId)}`,
    ),
});

export const pagerdutyListStatusPagePosts = tool({
  description: 'List public posts/updates published on a status page.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/status_pages/${encodeURIComponent(statusPageId)}/posts`),
});

export const pagerdutyGetStatusPagePost = tool({
  description: 'Get one status page post with its updates.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}`,
    ),
});

export const pagerdutyCreateStatusPagePost = tool({
  description: 'Publish a new post on a status page about an ongoing event.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    title: z.string().describe('Post title'),
    message: z.string().optional().describe('Post body'),
    severityId: z
      .string()
      .optional()
      .describe('Severity ID (see pagerdutyListStatusPageSeverities)'),
    statusId: z.string().optional().describe('Status ID (see pagerdutyListStatusPageStatuses)'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, title, message, severityId, statusId }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/status_pages/${encodeURIComponent(statusPageId)}/posts`, {
      body: {
        post: {
          title,
          ...(message ? { message } : {}),
          ...(severityId ? { severity: { id: severityId } } : {}),
          ...(statusId ? { status: { id: statusId } } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateStatusPagePost = tool({
  description: 'Edit a status page post title, message, severity, or status.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
    title: z.string().optional().describe('New title'),
    message: z.string().optional().describe('New body'),
    severityId: z.string().optional().describe('New severity ID'),
    statusId: z.string().optional().describe('New status ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId, title, message, severityId, statusId }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}`,
      {
        body: {
          post: {
            ...(title ? { title } : {}),
            ...(message ? { message } : {}),
            ...(severityId ? { severity: { id: severityId } } : {}),
            ...(statusId ? { status: { id: statusId } } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteStatusPagePost = tool({
  description: 'Delete a status page post.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}`,
    ),
});

export const pagerdutyListPostUpdates = tool({
  description: 'List incremental updates appended to a status page post.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/post_updates`,
    ),
});

export const pagerdutyCreatePostUpdate = tool({
  description: 'Append an update to a status page post as an event evolves.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
    message: z.string().describe('Update text'),
    statusId: z.string().optional().describe('New incident status ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId, message, statusId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/post_updates`,
      {
        body: {
          post_update: {
            message,
            ...(statusId ? { status: { id: statusId } } : {}),
          },
        },
      },
    ),
});

export const pagerdutyGetPostUpdate = tool({
  description: 'Get one status page post update.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
    updateId: z.string().describe('Post update ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId, updateId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/post_updates/${encodeURIComponent(updateId)}`,
    ),
});

export const pagerdutyUpdatePostUpdate = tool({
  description: 'Edit a status page post update.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
    updateId: z.string().describe('Post update ID'),
    message: z.string().optional().describe('New text'),
    statusId: z.string().optional().describe('New status ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId, updateId, message, statusId }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/post_updates/${encodeURIComponent(updateId)}`,
      {
        body: {
          post_update: {
            ...(message ? { message } : {}),
            ...(statusId ? { status: { id: statusId } } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeletePostUpdate = tool({
  description: 'Delete a status page post update.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
    updateId: z.string().describe('Post update ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId, updateId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/post_updates/${encodeURIComponent(updateId)}`,
    ),
});

export const pagerdutyGetPostPostmortem = tool({
  description: 'Get the postmortem attached to a status page post.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/postmortem`,
    ),
});

export const pagerdutyUpdatePostPostmortem = tool({
  description: 'Attach or update the postmortem on a status page post.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
    content: z.string().describe('Postmortem content (supports markup)'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId, content }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/postmortem`,
      { body: { postmortem: { content } } },
    ),
});

export const pagerdutyDeletePostPostmortem = tool({
  description: 'Remove the postmortem from a status page post.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    postId: z.string().describe('Post ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, postId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/status_pages/${encodeURIComponent(statusPageId)}/posts/${encodeURIComponent(postId)}/postmortem`,
    ),
});

export const pagerdutyListStatusPageSubscriptions = tool({
  description: 'List subscribers to a status page.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_pages/${encodeURIComponent(statusPageId)}/subscriptions`,
    ),
});

export const pagerdutyCreateStatusPageSubscription = tool({
  description: 'Subscribe an email/phone to status page notifications.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    address: z.string().describe('Email address or phone number'),
    type: z.string().optional().describe('Endpoint type, e.g. "email"'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, address, type }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/status_pages/${encodeURIComponent(statusPageId)}/subscriptions`,
      { body: { subscription: { subscriber: { address, ...(type ? { type } : {}) } } } },
    ),
});

export const pagerdutyDeleteStatusPageSubscription = tool({
  description: 'Remove a status page subscription.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
    subscriptionId: z.string().describe('Subscription ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId, subscriptionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/status_pages/${encodeURIComponent(statusPageId)}/subscriptions/${encodeURIComponent(subscriptionId)}`,
    ),
});

export const pagerdutyListStatusPageSeverities = tool({
  description: 'List severity levels usable on a status page.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_pages/${encodeURIComponent(statusPageId)}/severities`,
    ),
});

export const pagerdutyListStatusPageStatuses = tool({
  description: 'List incident statuses usable on a status page.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/status_pages/${encodeURIComponent(statusPageId)}/statuses`),
});

export const pagerdutyListStatusPageServices = tool({
  description: 'List services displayed on a status page.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statusPageId: z.string().describe('Status page ID'),
  }),
  execute: ({ pagerdutyApiKey, statusPageId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/status_pages/${encodeURIComponent(statusPageId)}/services`),
});

export const pagerdutyListStatusDashboards = tool({
  description: 'List internal status dashboards.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/status_dashboards'),
});

export const pagerdutyGetStatusDashboard = tool({
  description: 'Get one status dashboard by ID.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    dashboardId: z.string().describe('Dashboard ID'),
  }),
  execute: ({ pagerdutyApiKey, dashboardId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/status_dashboards/${encodeURIComponent(dashboardId)}`),
});

export const pagerdutyGetStatusDashboardBySlug = tool({
  description: 'Get a status dashboard by its URL slug.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    urlSlug: z.string().describe('Dashboard URL slug'),
  }),
  execute: ({ pagerdutyApiKey, urlSlug }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_dashboards/url_slugs/${encodeURIComponent(urlSlug)}`,
    ),
});

export const pagerdutyGetDashboardServiceImpacts = tool({
  description: 'Service impacts shown on a status dashboard.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    dashboardId: z.string().describe('Dashboard ID'),
  }),
  execute: ({ pagerdutyApiKey, dashboardId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/status_dashboards/${encodeURIComponent(dashboardId)}/service_impacts`,
    ),
});
