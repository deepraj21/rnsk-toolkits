// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    adsMutate,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
} from './client.js';

export const createCustomerList = tool({
    description:
        'Creates a customer list (UserList audience/remarketing list, not an account). Email-based lists must comply with Ads policies and consent laws; membership and targeting eligibility take hours to propagate.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        name: z.string().describe('Name of the customer list (UserList)'),
        description: z.string().optional().describe('Description of the customer list'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, name, description, customerId, loginCustomerId }) => {
        try {
            const create: Record<string, unknown> = {
                name,
                crmBasedUserList: {},
                membershipStatus: 'OPEN',
            };
            if (description) create.description = description;
            const result = await adsMutate(googleAdsToken, developerToken, 'userLists', {
                customerId,
                loginCustomerId,
                operations: [{ create }],
            });
            if (!result.ok) return { error: 'Failed to create customer list', details: result.error };
            const data = result.data as { results?: Array<{ resourceName?: string }> };
            return { resourceName: data.results?.[0]?.resourceName, ...result.data };
        } catch (error) {
            return {
                error: 'Error creating customer list',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
