// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError } from './client.js';

export const intercomCreateOrUpdateCompany = tool({
  description: 'Create a company by company_id, or update it when it already exists.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    companyId: z.string().optional().describe('your unique company ID (lookup key)'),
    name: z.string().optional(),
    plan: z.string().optional(),
    size: z.number().int().optional().describe('employee count'),
    website: z.string().optional(),
    industry: z.string().optional(),
    monthlySpend: z.number().int().optional().describe('whole integers only'),
    customAttributes: z.record(z.any()).optional(),
    remoteCreatedAt: z.number().int().optional().describe('unix timestamp'),
  }),
  execute: async ({
    intercomCredentials,
    companyId,
    name,
    plan,
    size,
    website,
    industry,
    monthlySpend,
    customAttributes,
    remoteCreatedAt,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies`, {
        method: 'POST',
        body: {
          companyId,
          name,
          plan,
          size,
          website,
          industry,
          monthlySpend,
          customAttributes,
          remoteCreatedAt,
        },
      });
      if (!result.ok) return failedResult('Failed to create or update company', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating or update company');
    }
  },
});

export const intercomRetrieveCompanies = tool({
  description: 'Fetch companies filtered by name, company_id, tag, or segment.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    name: z.string().optional(),
    companyId: z.string().optional(),
    tagId: z.string().optional(),
    segmentId: z.string().optional(),
    page: z.number().int().optional(),
    perPage: z.number().int().optional(),
  }),
  execute: async ({ intercomCredentials, name, companyId, tagId, segmentId, page, perPage }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies`, {
        method: 'GET',
        query: {
          name: name,
          companyId: companyId,
          tagId: tagId,
          segmentId: segmentId,
          page: page,
          perPage: perPage,
        },
      });
      if (!result.ok) return failedResult('Failed to retrieve companies', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving companies');
    }
  },
});

export const intercomRetrieveCompanyById = tool({
  description: 'Fetch a single company by Intercom ID.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/${id}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to retrieve company by id', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error retrieving company by id');
    }
  },
});

export const intercomUpdateCompany = tool({
  description: 'Update a company by Intercom ID. company_id cannot be changed.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string(),
    name: z.string().optional(),
    plan: z.string().optional(),
    size: z.number().int().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    monthlySpend: z.number().int().optional(),
    customAttributes: z.record(z.any()).optional(),
    remoteCreatedAt: z.number().int().optional(),
  }),
  execute: async ({
    intercomCredentials,
    id,
    name,
    plan,
    size,
    website,
    industry,
    monthlySpend,
    customAttributes,
    remoteCreatedAt,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/${id}`, {
        method: 'PUT',
        body: {
          id,
          name,
          plan,
          size,
          website,
          industry,
          monthlySpend,
          customAttributes,
          remoteCreatedAt,
        },
      });
      if (!result.ok) return failedResult('Failed to update company', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating company');
    }
  },
});

export const intercomDeleteCompany = tool({
  description: 'Delete a single company.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string(),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/${id}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete company', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting company');
    }
  },
});

export const intercomListCompanies = tool({
  description: 'List companies sorted by recent activity, paginated.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    page: z.number().int().optional(),
    perPage: z.number().int().optional().describe('max 60'),
    order: z.string().optional().describe('asc or desc'),
  }),
  execute: async ({ intercomCredentials, page, perPage, order }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/list`, {
        method: 'POST',
        query: { page: page, perPage: perPage, order: order },
      });
      if (!result.ok) return failedResult('Failed to list companies', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing companies');
    }
  },
});

export const intercomScrollCompanies = tool({
  description: 'Iterate all companies efficiently via the scroll API for huge datasets.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    scrollParam: z
      .string()
      .optional()
      .describe('scroll cursor from the previous response; omit for the first page'),
  }),
  execute: async ({ intercomCredentials, scrollParam }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/scroll`, {
        method: 'GET',
        query: { scrollParam: scrollParam },
      });
      if (!result.ok) return failedResult('Failed to scroll companies', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error scrolling companies');
    }
  },
});

export const intercomListCompanyContacts = tool({
  description: 'Fetch all contacts belonging to a company.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string().describe('company ID'),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/${id}/contacts`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list company contacts', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing company contacts');
    }
  },
});

export const intercomListCompanySegments = tool({
  description: 'Fetch segments that a company belongs to.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    id: z.string().describe('company ID'),
  }),
  execute: async ({ intercomCredentials, id }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/${id}/segments`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list company segments', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing company segments');
    }
  },
});

export const intercomListCompanyNotes = tool({
  description: 'Fetch notes added to a company record.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    companyId: z.string(),
  }),
  execute: async ({ intercomCredentials, companyId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/companies/${companyId}/notes`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list company notes', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing company notes');
    }
  },
});
