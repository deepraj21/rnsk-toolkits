// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pinterestRequest, toPinterestError } from './client.js';

const tokenField = z
    .string()
    .optional()
    .describe('Injected Pinterest OAuth access token — match manifest tokenField');
const pinIdField = z.string().describe('Numeric Pinterest Pin ID, e.g. "971159107167355483"');
const pageFields = {
    bookmark: z.string().optional().describe('Opaque bookmark from the previous page. Omit for the first page.'),
    pageSize: z.number().int().min(1).max(250).optional().describe('Max items to return, 1-250 (default 25)'),
};

const mediaSourceField = z
    .record(z.any())
    .describe(
        'Media source object with source_type: "image_url" ({source_type,url}), "image_base64" ({source_type,content_type,data}), "multiple_image_urls" or "multiple_image_base64" carousel ({source_type,items:[2-5],index?}), or "video_id" ({source_type,media_id from registerMedia,cover_image_url?}).',
    );

export const listPins = tool({
    description:
        "List account Pins with creative-type and metrics filters. For reliable secret-board inventory use board listing instead; account listing may omit secret-board Pins.",
    inputSchema: z.object({
        pinterestToken: tokenField,
        creativeTypes: z
            .array(z.string())
            .optional()
            .describe('Filter, e.g. ["REGULAR","VIDEO"]. Sent as one comma-separated value.'),
        pinMetrics: z.boolean().optional().describe('Include 90-day and lifetime Pin metrics'),
        ...pageFields,
    }),
    execute: async ({ pinterestToken, creativeTypes, pinMetrics, bookmark, pageSize }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/pins', {
                query: {
                    creative_types: creativeTypes?.join(','),
                    pin_metrics: pinMetrics,
                    bookmark,
                    page_size: pageSize,
                },
            });
            if (!result.ok) return failedResult('Failed to list Pinterest Pins', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error listing Pinterest Pins');
        }
    },
});

export const getPin = tool({
    description: 'Get one public or secret Pin by ID, with optional 90-day and lifetime metrics.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        pinId: pinIdField,
        pinMetrics: z.boolean().optional().describe('Include available Pin metrics'),
    }),
    execute: async ({ pinterestToken, pinId, pinMetrics }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/pins/${encodeURIComponent(pinId)}`, {
                query: { pin_metrics: pinMetrics },
            });
            if (!result.ok) return failedResult(`Failed to get Pinterest Pin "${pinId}"`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error getting Pinterest Pin "${pinId}"`);
        }
    },
});

export const createPin = tool({
    description:
        'Create an image, carousel, or registered-video Pin on a board. Needs pins:write (pins:write_secret for secret boards). Trial apps are blocked from creating Pins on api.pinterest.com.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        boardId: z.string().describe('Numeric destination board ID'),
        mediaSource: mediaSourceField,
        title: z.string().max(100).optional().describe('Pin title, up to 100 characters'),
        description: z.string().max(800).optional().describe('Pin description, up to 800 characters'),
        link: z.string().max(2048).optional().describe('Destination URL, up to 2048 characters'),
        altText: z.string().max(500).optional().describe('Accessible description, up to 500 characters'),
        boardSectionId: z.string().optional().describe('Numeric section ID within the board'),
        dominantColor: z.string().optional().describe('Dominant hex color, e.g. "#6E7874"'),
        aiDisclosureValues: z
            .array(z.enum(['AI_MODIFIED', 'SYNTHETIC_PERFORMER']))
            .optional()
            .describe('Creator AI declarations, sent as ai_disclosures.values'),
    }),
    execute: async ({ pinterestToken, boardId, mediaSource, title, description, link, altText, boardSectionId, dominantColor, aiDisclosureValues }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/pins', {
                method: 'POST',
                body: {
                    board_id: boardId,
                    media_source: mediaSource,
                    title,
                    description,
                    link,
                    alt_text: altText,
                    board_section_id: boardSectionId,
                    dominant_color: dominantColor,
                    ...(aiDisclosureValues ? { ai_disclosures: { values: aiDisclosureValues } } : {}),
                },
            });
            if (!result.ok) return failedResult('Failed to create Pinterest Pin', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error creating Pinterest Pin');
        }
    },
});

export const updatePin = tool({
    description:
        'Update content on an owned Pin or move it to another board/section. Provide at least one update field.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        pinId: pinIdField,
        title: z.string().max(100).optional().describe('Replacement title (null clears it)'),
        description: z.string().max(800).optional().describe('Replacement description (null clears it)'),
        link: z.string().max(2048).optional().describe('Replacement destination URL (null clears it)'),
        altText: z.string().max(500).optional().describe('Replacement alt text (null clears it)'),
        boardId: z.string().optional().describe('Destination board ID when moving the Pin'),
        boardSectionId: z.string().optional().describe('Destination section ID (null removes from section)'),
        aiDisclosureValues: z
            .array(z.enum(['AI_MODIFIED', 'SYNTHETIC_PERFORMER']))
            .optional()
            .describe('Replacement AI disclosures; empty list clears them'),
    }),
    execute: async ({ pinterestToken, pinId, title, description, link, altText, boardId, boardSectionId, aiDisclosureValues }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/pins/${encodeURIComponent(pinId)}`, {
                method: 'PATCH',
                body: {
                    title,
                    description,
                    link,
                    alt_text: altText,
                    board_id: boardId,
                    board_section_id: boardSectionId,
                    ...(aiDisclosureValues !== undefined
                        ? { ai_disclosures: { values: aiDisclosureValues } }
                        : {}),
                },
            });
            if (!result.ok) return failedResult(`Failed to update Pinterest Pin "${pinId}"`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error updating Pinterest Pin "${pinId}"`);
        }
    },
});

export const deletePin = tool({
    description: 'Permanently delete a Pin by ID.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        pinId: pinIdField,
    }),
    execute: async ({ pinterestToken, pinId }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/pins/${encodeURIComponent(pinId)}`, {
                method: 'DELETE',
            });
            if (!result.ok) return failedResult(`Failed to delete Pinterest Pin "${pinId}"`, result);
            return { success: true, pinId, statusCode: result.status };
        } catch (error) {
            return toPinterestError(error, `Error deleting Pinterest Pin "${pinId}"`);
        }
    },
});

export const savePin = tool({
    description: 'Save (repin) a Pin to one of your boards, optionally into a section.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        pinId: pinIdField,
        boardId: z.string().optional().describe('Destination board ID'),
        boardSectionId: z.string().optional().describe('Destination section ID within the board'),
    }),
    execute: async ({ pinterestToken, pinId, boardId, boardSectionId }) => {
        try {
            const result = await pinterestRequest(pinterestToken, `/pins/${encodeURIComponent(pinId)}/save`, {
                method: 'POST',
                body: { board_id: boardId, board_section_id: boardSectionId },
            });
            if (!result.ok) return failedResult(`Failed to save Pinterest Pin "${pinId}"`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error saving Pinterest Pin "${pinId}"`);
        }
    },
});

export const getPinAnalytics = tool({
    description:
        'Get daily, summary, and lifetime analytics for one Pin over a date range. Recent daily values may be PROCESSING.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        pinId: pinIdField,
        startDate: z.string().describe('UTC start date YYYY-MM-DD, at most 90 days before today'),
        endDate: z.string().describe('UTC end date YYYY-MM-DD, at most 90 days after start_date'),
        metricTypes: z
            .array(z.string())
            .min(1)
            .describe(
                'Metrics, e.g. ["IMPRESSION","SAVE"]. Sent comma-separated. Options: IMPRESSION, OUTBOUND_CLICK, PIN_CLICK, SAVE, SAVE_RATE, TOTAL_COMMENTS, TOTAL_REACTIONS, USER_FOLLOW, PROFILE_VISIT, VIDEO_MRC_VIEW, VIDEO_10S_VIEW, QUARTILE_95_PERCENT_VIEW, VIDEO_V50_WATCH_TIME, VIDEO_START, VIDEO_AVG_WATCH_TIME.',
            ),
        appType: z.enum(['ALL', 'MOBILE', 'TABLET', 'WEB']).optional().describe('Device filter (default ALL)'),
        splitField: z.enum(['NO_SPLIT', 'APP_TYPE']).optional().describe('Split into app-type buckets or one aggregate'),
    }),
    execute: async ({ pinterestToken, pinId, startDate, endDate, metricTypes, appType, splitField }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/pins/${encodeURIComponent(pinId)}/analytics`,
                {
                    query: {
                        start_date: startDate,
                        end_date: endDate,
                        metric_types: metricTypes.join(','),
                        app_types: appType,
                        split_field: splitField,
                    },
                },
            );
            if (!result.ok) return failedResult('Failed to get Pinterest Pin analytics', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error getting Pinterest Pin analytics');
        }
    },
});

export const getMultiPinAnalytics = tool({
    description: 'Get analytics for up to 100 Pins in one call over a date range.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        pinIds: z.array(z.string()).min(1).max(100).describe('Pin IDs, max 100'),
        startDate: z.string().describe('UTC start date YYYY-MM-DD'),
        endDate: z.string().describe('UTC end date YYYY-MM-DD'),
        metricTypes: z
            .array(z.string())
            .min(1)
            .describe('Metrics, e.g. ["IMPRESSION","SAVE"]. Sent comma-separated.'),
        appType: z.enum(['ALL', 'MOBILE', 'TABLET', 'WEB']).optional().describe('Device filter (default ALL)'),
    }),
    execute: async ({ pinterestToken, pinIds, startDate, endDate, metricTypes, appType }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/pins/analytics', {
                query: {
                    pin_ids: pinIds.join(','),
                    start_date: startDate,
                    end_date: endDate,
                    metric_types: metricTypes.join(','),
                    app_types: appType,
                },
            });
            if (!result.ok) return failedResult('Failed to get multi-Pin analytics', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error getting multi-Pin analytics');
        }
    },
});
