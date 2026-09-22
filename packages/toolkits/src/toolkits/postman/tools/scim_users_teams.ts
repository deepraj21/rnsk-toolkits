// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { postmanRequest, toPostmanError } from './client.js';

const authField = {
    postmanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

function missingKey() {
    return { error: 'Postman API key is required. Connect Postman first.' };
};

// ---- Team users (GET /users) ----

export const postmanGetAllTeamUsers = tool({
    description:
        'Get information about all users on the Postman team. Use when you need to list all team members and their details including roles and join dates. Returns an array of user objects with their IDs, names, usernames, emails, roles, and join timestamps.',
    inputSchema: z.object({
        ...authField,
        groupId: z.string().optional().describe('Filter users by group ID'),
    }),
    execute: async ({ postmanApiKey, groupId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/users', {
                query: { groupId },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get team users');
        }
    },
});

export const postmanGetATeamUser = tool({
    description:
        'Get information about a user on the Postman team. Use when you need to retrieve details about a specific team member including their ID, name, email, roles, and join date.',
    inputSchema: z.object({
        ...authField,
        userId: z.number().int().describe('The ID of the user to retrieve information about'),
    }),
    execute: async ({ postmanApiKey, userId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/users/${encodeURIComponent(String(userId))}`);
        } catch (error) {
            return toPostmanError(error, 'Failed to get team user');
        }
    },
});

export const postmanGetAuthenticatedUser = tool({
    description:
        'Get information about the authenticated user. Use when you need to retrieve details about the current authenticated user, including their user ID, username, and email address.',
    inputSchema: z.object({
        ...authField,
    }),
    execute: async ({ postmanApiKey }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/me');
        } catch (error) {
            return toPostmanError(error, 'Failed to get authenticated user');
        }
    },
});

// ---- Groups (GET /groups) ----

export const postmanGetAllGroups = tool({
    description:
        'Get all user groups in a Postman team. Use when you need to list all groups and their details including member counts and timestamps. Returns an array of group objects with their IDs, names, team IDs, user counts, and creation/update timestamps.',
    inputSchema: z.object({
        ...authField,
        limit: z.number().int().min(1).optional().describe('Maximum number of groups to return per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ postmanApiKey, limit, cursor }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/groups', {
                query: { limit, cursor },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to get groups');
        }
    },
});

// ---- SCIM (GET /scim/v2/...) ----

export const postmanGetResourceTypes = tool({
    description:
        "Get all resource types supported by Postman's SCIM API. Use when you need to discover what resource types (e.g., User, Group) are available in the SCIM API and their corresponding endpoints and schemas.",
    inputSchema: z.object({
        ...authField,
    }),
    execute: async ({ postmanApiKey }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/scim/v2/ResourceTypes');
        } catch (error) {
            return toPostmanError(error, 'Failed to get resource types');
        }
    },
});

export const postmanGetServiceProviderConfiguration = tool({
    description:
        "Get Postman's SCIM API service provider configuration information. Use when you need to discover supported SCIM operations, capabilities, and authentication schemes. Returns configuration details including support for PATCH, bulk operations, filtering, sorting, and ETag handling.",
    inputSchema: z.object({
        ...authField,
    }),
    execute: async ({ postmanApiKey }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/scim/v2/ServiceProviderConfig');
        } catch (error) {
            return toPostmanError(error, 'Failed to get service provider configuration');
        }
    },
});

// ---- Billing (GET /accounts) ----

export const postmanGetBillingAccountDetails = tool({
    description:
        'Retrieve Postman billing account details for the authenticated team. Use when you need to access account information such as account ID, team ID, account state, billing slots, sales channel, or billing email.',
    inputSchema: z.object({
        ...authField,
    }),
    execute: async ({ postmanApiKey }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', '/accounts');
        } catch (error) {
            return toPostmanError(error, 'Failed to get billing accounts');
        }
    },
});

export const postmanListAccountInvoices = tool({
    description:
        'Get all invoices for a Postman billing account filtered by status. Use when you need to retrieve invoice history for an account. The account ID must first be obtained from the billing accounts endpoint.',
    inputSchema: z.object({
        ...authField,
        accountId: z.string().describe('The billing account ID obtained from the billing accounts endpoint'),
        status: z.string().optional().describe("Filter invoices by status, e.g. 'PAID'. If not provided, returns all invoices"),
    }),
    execute: async ({ postmanApiKey, accountId, status }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'GET', `/accounts/${encodeURIComponent(accountId)}/invoices`, {
                query: { status },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to list account invoices');
        }
    },
});
