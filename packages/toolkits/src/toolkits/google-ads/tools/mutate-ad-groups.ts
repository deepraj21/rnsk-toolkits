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

const operationSchema = z.record(z.any()).describe(
    'AdGroup operation: {create: {name, campaign, type?, status?}}, {update: {resource_name, ...}}, or {remove: resourceName} (irreversible). Snake_case keys accepted.',
);

export const mutateAdGroups = tool({
    description:
        'Creates, updates, or removes ad groups within campaigns in batch. Removes are irreversible — deleted ad groups cannot be recovered.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        operations: z.array(operationSchema).min(1),
        validateOnly: z.boolean().optional().describe('Validate without applying changes'),
        partialFailure: z.boolean().optional().describe('Valid ops succeed even if others fail'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, operations, validateOnly, partialFailure, customerId, loginCustomerId }) => {
        try {
            const result = await adsMutate(googleAdsToken, developerToken, 'adGroups', {
                customerId,
                loginCustomerId,
                operations,
                validateOnly,
                partialFailure,
            });
            if (!result.ok) return { error: 'Failed to mutate ad groups', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating ad groups',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
