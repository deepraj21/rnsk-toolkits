// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');
const pageFields = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.number().int().min(0).optional().describe('Pagination offset'),
  total: z.boolean().optional().describe('Populate the total count (slower)'),
};

export const pagerdutyListBusinessServices = tool({
  description:
    'List business services (customer-facing capabilities composed of technical services).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/business_services', { query }),
});

export const pagerdutyGetBusinessService = tool({
  description: 'Get one business service with subscribers and impact status.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/business_services/${encodeURIComponent(businessServiceId)}`,
    ),
});

export const pagerdutyCreateBusinessService = tool({
  description: 'Create a business service owned by a team.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Business service name'),
    description: z.string().optional().describe('What capability this represents'),
    pointOfContact: z.string().optional().describe('Owner/contact string'),
    teamId: z.string().optional().describe('Owning team ID'),
  }),
  execute: ({ pagerdutyApiKey, name, description, pointOfContact, teamId }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/business_services', {
      body: {
        business_service: {
          name,
          ...(description ? { description } : {}),
          ...(pointOfContact ? { point_of_contact: pointOfContact } : {}),
          ...(teamId ? { team: { id: teamId } } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateBusinessService = tool({
  description: 'Update a business service name, description, or ownership.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    pointOfContact: z.string().optional().describe('New owner/contact'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId, name, description, pointOfContact }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/business_services/${encodeURIComponent(businessServiceId)}`,
      {
        body: {
          business_service: {
            ...(name ? { name } : {}),
            ...(description ? { description } : {}),
            ...(pointOfContact ? { point_of_contact: pointOfContact } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteBusinessService = tool({
  description: 'Delete a business service and its subscriptions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/business_services/${encodeURIComponent(businessServiceId)}`,
    ),
});

export const pagerdutyListBusinessServiceSubscribers = tool({
  description: 'List subscribers notified about a business service impact.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/business_services/${encodeURIComponent(businessServiceId)}/subscribers`,
    ),
});

export const pagerdutyAddBusinessServiceSubscribers = tool({
  description: 'Subscribe users/teams to business service impact notifications.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID'),
    subscribers: z
      .array(z.object({ id: z.string(), type: z.string() }).passthrough())
      .min(1)
      .describe('Subscribers [{id, type: user_reference|team_reference}]'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId, subscribers }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/business_services/${encodeURIComponent(businessServiceId)}/subscribers`,
      { body: { subscribers } },
    ),
});

export const pagerdutyRemoveBusinessServiceSubscriber = tool({
  description: 'Unsubscribe an entity from business service notifications.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID'),
    subscriberId: z.string().describe('Subscriber entity ID'),
    subscriberType: z.string().describe('Subscriber type, e.g. "user"'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId, subscriberId, subscriberType }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/business_services/${encodeURIComponent(businessServiceId)}/unsubscribe`,
      { body: { subscribers: [{ id: subscriberId, type: subscriberType }] } },
    ),
});

export const pagerdutyGetBusinessServiceImpacts = tool({
  description: 'Current impact state across business services.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/business_services/impacts', { query }),
});

export const pagerdutyGetBusinessServiceImpactors = tool({
  description: 'Technical services currently impacting business services.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/business_services/impactors', { query }),
});

export const pagerdutyGetSupportingServiceImpacts = tool({
  description: 'Business services impacted by one supporting (technical) service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/business_services/${encodeURIComponent(businessServiceId)}/supporting_services/impacts`,
    ),
});

export const pagerdutyGetPriorityThresholds = tool({
  description: 'Get business-service priority thresholds driving severity mapping.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/business_services/priority_thresholds'),
});

export const pagerdutySetGlobalPriorityThreshold = tool({
  description: 'Set the global priority threshold for business service impact calculation.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    priorityId: z.string().describe('Priority ID acting as the threshold'),
    order: z.number().describe('Threshold order value'),
  }),
  execute: ({ pagerdutyApiKey, priorityId, order }) =>
    pdRequest(pagerdutyApiKey, 'PUT', '/business_services/priority_thresholds', {
      body: { global_threshold: { id: priorityId, order } },
    }),
});

export const pagerdutyDeletePriorityThresholds = tool({
  description: 'Delete business-service priority thresholds (revert to defaults).',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', '/business_services/priority_thresholds'),
});

export const pagerdutyAssociateServiceDependencies = tool({
  description: 'Declare supporting-service → dependent-service dependencies for impact mapping.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    relationships: z
      .array(
        z.object({
          supportingServiceId: z.string().describe('Service that supports'),
          dependentServiceId: z.string().describe('Service that depends'),
        }),
      )
      .min(1)
      .describe('Dependencies to create'),
  }),
  execute: ({ pagerdutyApiKey, relationships }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/service_dependencies/associate', {
      body: {
        relationships: relationships.map((r) => ({
          supporting_service: { id: r.supportingServiceId, type: 'technical_service_reference' },
          dependent_service: { id: r.dependentServiceId, type: 'technical_service_reference' },
        })),
      },
    }),
});

export const pagerdutyDisassociateServiceDependencies = tool({
  description: 'Remove service dependency relationships.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    relationships: z
      .array(
        z.object({
          supportingServiceId: z.string().describe('Supporting service ID'),
          dependentServiceId: z.string().describe('Dependent service ID'),
        }),
      )
      .min(1)
      .describe('Dependencies to remove'),
  }),
  execute: ({ pagerdutyApiKey, relationships }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/service_dependencies/disassociate', {
      body: {
        relationships: relationships.map((r) => ({
          supporting_service: { id: r.supportingServiceId, type: 'technical_service_reference' },
          dependent_service: { id: r.dependentServiceId, type: 'technical_service_reference' },
        })),
      },
    }),
});

export const pagerdutyGetBusinessServiceDependencies = tool({
  description: 'Dependency graph around one business service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    businessServiceId: z.string().describe('Business service ID'),
  }),
  execute: ({ pagerdutyApiKey, businessServiceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/service_dependencies/business_services/${encodeURIComponent(businessServiceId)}`,
    ),
});

export const pagerdutyGetTechnicalServiceDependencies = tool({
  description: 'Dependency graph around one technical service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Technical service ID'),
  }),
  execute: ({ pagerdutyApiKey, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/service_dependencies/technical_services/${encodeURIComponent(serviceId)}`,
    ),
});
