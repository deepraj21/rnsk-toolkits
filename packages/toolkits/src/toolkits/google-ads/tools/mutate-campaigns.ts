// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    adsMutate,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
    toGoogleAdsJson,
} from './client.js';

const campaignPayload = z.record(z.any()).describe(
    'Campaign fields: name, status, campaign_budget (existing budget resource name, required for create — amount lives on the CampaignBudget resource), advertising_channel_type, network_settings, bidding_strategy or manual_cpc, dates, tracking, geo_target_type_setting. Snake_case keys accepted.',
);

const operationSchema = z.object({
    operationType: z.enum(['create', 'update', 'remove']).describe('Type of operation'),
    create: campaignPayload.optional(),
    update: campaignPayload.optional(),
    remove: z.string().optional().describe('Campaign resource name to remove (irreversible)'),
});

export const mutateCampaigns = tool({
    description:
        'Creates, updates, or removes campaigns in batch. Removes are irreversible — deleted campaigns cannot be recovered. Use validateOnly to test changes first.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        operations: z.array(operationSchema).min(1),
        validateOnly: z.boolean().optional().describe('Validate without applying changes'),
        partialFailure: z.boolean().optional().describe('Valid ops succeed even if others fail'),
        responseContentType: z.string().optional().describe("RESOURCE_NAME_ONLY or MUTABLE_RESOURCE"),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, operations, validateOnly, partialFailure, responseContentType, customerId, loginCustomerId }) => {
        try {
            const normalized = operations.map((op) => {
                if (op.operationType === 'create') return { create: op.create };
                if (op.operationType === 'update') return { update: op.update };
                return { remove: op.remove };
            });
            const result = await adsMutate(googleAdsToken, developerToken, 'campaigns', {
                customerId,
                loginCustomerId,
                operations: toGoogleAdsJson(normalized) as Array<Record<string, unknown>>,
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to mutate campaigns', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error mutating campaigns',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
