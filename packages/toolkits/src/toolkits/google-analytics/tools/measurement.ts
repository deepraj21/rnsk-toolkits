// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

const mpEvent = z.object({
    name: z.string().max(40).describe("Event name, e.g. 'purchase', 'login', 'page_view'"),
    params: z.record(z.any()).optional().describe("Parameters, e.g. {currency:'USD', value:42.5, transaction_id:'T12345'}"),
});

const mpBody = {
    measurementId: z.string().describe("Web stream measurement ID, e.g. 'G-XXXXXXX'"),
    apiSecret: z.string().describe('Measurement Protocol API secret (see listMeasurementProtocolSecrets)'),
    clientId: z.string().describe('Client ID (same value used client-side for session stitching)'),
    events: z.array(mpEvent).min(1).max(25).describe('1-25 events per request'),
    userId: z.string().optional(),
    timestampMicros: z.number().optional().describe('Unix microseconds; defaults to collection time'),
    userProperties: z.record(z.any()).optional(),
    consent: z.object({
        adUserData: z.string().optional().describe("'GRANTED' or 'DENIED'"),
        adPersonalization: z.string().optional().describe("'GRANTED' or 'DENIED'"),
    }).catchall(z.unknown()).optional(),
};

async function postMeasurementProtocol(
    measurementId: string,
    apiSecret: string,
    payload: Record<string, unknown>,
    debug: boolean,
    action: string,
) {
    try {
        const base = debug ? 'https://www.google-analytics.com/debug/mp/collect' : 'https://www.google-analytics.com/mp/collect';
        const url = `${base}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const details = await response.text().catch(() => '');
            return { error: `Failed to ${action} (HTTP ${response.status})`, details };
        }
        const data = await response.json().catch(() => ({}));
        return debug ? data : { success: true, ...(typeof data === 'object' ? data : {}) };
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

function toPayload(input: Record<string, unknown>): Record<string, unknown> {
    const { measurementId, apiSecret, ...rest } = input;
    return rest;
}

export const sendEvents = tool({
    description: 'Sends server-side events via Measurement Protocol (API-secret auth, no OAuth). Events appear in reports within 24-48h. Validate first with validateEvents.',
    inputSchema: z.object(mpBody),
    execute: async (input: any) =>
        postMeasurementProtocol(input.measurementId, input.apiSecret, toPayload(input), false, 'send events'),
});

export const validateEvents = tool({
    description: 'Validates Measurement Protocol events against the debug endpoint without recording them. Fix validationMessages before calling sendEvents.',
    inputSchema: z.object(mpBody),
    execute: async (input: any) =>
        postMeasurementProtocol(input.measurementId, input.apiSecret, toPayload(input), true, 'validate events'),
});
