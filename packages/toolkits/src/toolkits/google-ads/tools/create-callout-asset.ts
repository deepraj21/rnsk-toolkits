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

const scheduleSchema = z.object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).describe('Day when the callout is shown'),
    startHour: z.number().min(0).max(23),
    startMinute: z.enum(['ZERO', 'FIFTEEN', 'THIRTY', 'FORTY_FIVE']),
    endHour: z.number().min(0).max(24),
    endMinute: z.enum(['ZERO', 'FIFTEEN', 'THIRTY', 'FORTY_FIVE']),
});

export const createCalloutAsset = tool({
    description:
        'Creates an immutable account asset containing a validated callout. Associate the returned resource with mutateCustomerAssets using field_type CALLOUT; cleanup removes that association (assets cannot be deleted).',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        callout: z.object({
            calloutText: z.string().min(1).max(25).describe('Callout text, up to 25 characters'),
            startDate: z.string().optional().describe('First eligible date YYYY-MM-DD'),
            endDate: z.string().optional().describe('Last eligible date YYYY-MM-DD'),
            adScheduleTargets: z.array(scheduleSchema).max(42).optional().describe('Weekly serving intervals, at most six per day'),
        }),
        name: z.string().optional().describe('Optional internal name for the immutable asset'),
        validateOnly: z.boolean().optional().describe('Validate without applying changes'),
        partialFailure: z.boolean().optional().describe('Valid ops succeed even if others fail'),
        responseContentType: z.enum(['RESOURCE_NAME_ONLY', 'MUTABLE_RESOURCE']).optional().describe('How much of each mutated resource to return'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, callout, name, validateOnly, partialFailure, responseContentType, customerId, loginCustomerId }) => {
        try {
            const calloutAsset: Record<string, unknown> = { calloutText: callout.calloutText };
            if (callout.startDate) calloutAsset.startDate = callout.startDate;
            if (callout.endDate) calloutAsset.endDate = callout.endDate;
            if (callout.adScheduleTargets) calloutAsset.adScheduleTargets = callout.adScheduleTargets;
            const create: Record<string, unknown> = { calloutAsset };
            if (name) create.name = name;
            const result = await adsMutate(googleAdsToken, developerToken, 'assets', {
                customerId,
                loginCustomerId,
                operations: [{ create }],
                validateOnly,
                partialFailure,
                responseContentType,
            });
            if (!result.ok) return { error: 'Failed to create callout asset', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error creating callout asset',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
