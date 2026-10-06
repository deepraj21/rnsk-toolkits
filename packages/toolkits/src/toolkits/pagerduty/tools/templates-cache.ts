// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');

export const pagerdutyListTemplates = tool({
  description: 'List status-update templates for consistent stakeholder comms.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/templates'),
});

export const pagerdutyGetTemplate = tool({
  description: 'Get one status-update template with its body and subject.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    templateId: z.string().describe('Template ID'),
  }),
  execute: ({ pagerdutyApiKey, templateId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/templates/${encodeURIComponent(templateId)}`),
});

export const pagerdutyCreateTemplate = tool({
  description: 'Create a reusable status-update template.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Template name'),
    template: z.record(z.any()).describe('Template {summary, html_message, message, subject, ...}'),
  }),
  execute: ({ pagerdutyApiKey, name, template }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/templates', {
      body: { template: { name, ...template } },
    }),
});

export const pagerdutyUpdateTemplate = tool({
  description: 'Update a status-update template content.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    templateId: z.string().describe('Template ID'),
    template: z.record(z.any()).describe('Template fields to update'),
  }),
  execute: ({ pagerdutyApiKey, templateId, template }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/templates/${encodeURIComponent(templateId)}`, {
      body: { template },
    }),
});

export const pagerdutyDeleteTemplate = tool({
  description: 'Delete a status-update template.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    templateId: z.string().describe('Template ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, templateId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/templates/${encodeURIComponent(templateId)}`),
});

export const pagerdutyListTemplateFields = tool({
  description: 'List available template placeholder fields for rendering.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/templates/fields'),
});

export const pagerdutyRenderTemplate = tool({
  description: 'Render a status-update template against an incident to preview the message.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    templateId: z.string().describe('Template ID'),
    incidentId: z.string().describe('Incident to render the template for'),
  }),
  execute: ({ pagerdutyApiKey, templateId, incidentId }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/templates/${encodeURIComponent(templateId)}/render`, {
      body: { incident: { id: incidentId, type: 'incident_reference' } },
    }),
});

const cacheId = {
  cacheVariableId: z.string().describe('Cache variable ID'),
};

export const pagerdutyListGlobalCacheVariables = tool({
  description: 'List cache variables on a global event orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/cache_variables`,
    ),
});

export const pagerdutyCreateGlobalCacheVariable = tool({
  description: 'Create a cache variable for orchestration rules (e.g. lookups, thresholds).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    name: z.string().describe('Variable name referenced in conditions'),
    dataType: z.string().optional().describe('Data type, e.g. "string"'),
    configuration: z.record(z.any()).optional().describe('Variable configuration/refresh settings'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, name, dataType, configuration }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/cache_variables`,
      {
        body: {
          cache_variable: {
            name,
            ...(dataType ? { data_type: dataType } : {}),
            ...(configuration ? { configuration } : {}),
          },
        },
      },
    ),
});

export const pagerdutyGetGlobalCacheVariable = tool({
  description: 'Get one global orchestration cache variable.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    ...cacheId,
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, cacheVariableId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/cache_variables/${encodeURIComponent(cacheVariableId)}`,
    ),
});

export const pagerdutyUpdateGlobalCacheVariable = tool({
  description: 'Update a global orchestration cache variable.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    ...cacheId,
    name: z.string().optional().describe('New name'),
    configuration: z.record(z.any()).optional().describe('New configuration'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, cacheVariableId, name, configuration }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/cache_variables/${encodeURIComponent(cacheVariableId)}`,
      {
        body: {
          cache_variable: {
            ...(name ? { name } : {}),
            ...(configuration ? { configuration } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteGlobalCacheVariable = tool({
  description: 'Delete a global orchestration cache variable.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    ...cacheId,
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, cacheVariableId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/cache_variables/${encodeURIComponent(cacheVariableId)}`,
    ),
});

export const pagerdutyListServiceCacheVariables = tool({
  description: 'List cache variables on a service-level orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
  }),
  execute: ({ pagerdutyApiKey, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}/cache_variables`,
    ),
});

export const pagerdutyCreateServiceCacheVariable = tool({
  description: 'Create a cache variable on a service-level orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    name: z.string().describe('Variable name'),
    dataType: z.string().optional().describe('Data type, e.g. "string"'),
    configuration: z.record(z.any()).optional().describe('Variable configuration'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, name, dataType, configuration }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}/cache_variables`,
      {
        body: {
          cache_variable: {
            name,
            ...(dataType ? { data_type: dataType } : {}),
            ...(configuration ? { configuration } : {}),
          },
        },
      },
    ),
});

export const pagerdutyGetServiceCacheVariable = tool({
  description: 'Get one service orchestration cache variable.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    ...cacheId,
  }),
  execute: ({ pagerdutyApiKey, serviceId, cacheVariableId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}/cache_variables/${encodeURIComponent(cacheVariableId)}`,
    ),
});

export const pagerdutyUpdateServiceCacheVariable = tool({
  description: 'Update a service orchestration cache variable.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    ...cacheId,
    name: z.string().optional().describe('New name'),
    configuration: z.record(z.any()).optional().describe('New configuration'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, cacheVariableId, name, configuration }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}/cache_variables/${encodeURIComponent(cacheVariableId)}`,
      {
        body: {
          cache_variable: {
            ...(name ? { name } : {}),
            ...(configuration ? { configuration } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteServiceCacheVariable = tool({
  description: 'Delete a service orchestration cache variable.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    ...cacheId,
  }),
  execute: ({ pagerdutyApiKey, serviceId, cacheVariableId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}/cache_variables/${encodeURIComponent(cacheVariableId)}`,
    ),
});
