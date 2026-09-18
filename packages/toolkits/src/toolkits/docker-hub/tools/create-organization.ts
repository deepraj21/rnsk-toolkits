// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dockerHubRequest, buildQueryString } from './utils.js';

export const createOrganization = tool({
    description: 'Create a new Docker Hub organization.',
    inputSchema: z.object({
        dockerHubCredentials: z.string().describe('Docker Hub credentials JSON with username and personalAccessToken'),
        orgname: z.string().describe('Unique organization slug (lowercase letters, numbers, ., _, or -)'),
        company: z.string().optional().describe('Company name associated with the organization'),
    }),

    execute: async ({ dockerHubCredentials, orgname, company }) => {
        try {
            const result = await dockerHubRequest(dockerHubCredentials, '/v2/orgs/', {
                method: 'POST',
                body: { orgname, ...(company ? { company } : {}) },
            });

            if (!result.ok) {
                return { error: 'Failed to create organization', details: result.data, statusCode: result.status };
            }

            return result.data;
        } catch (error) {
            return { error: 'Error creating organization', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
