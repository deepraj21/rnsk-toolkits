// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const getAnnouncementAddOnContext = tool({
    description: 'Gets add-on iframe metadata for an announcement: user role (student/teacher), submission ID, grade support.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Announcement ID with the attached add-on'),
        addOnToken: z.string().optional().describe('Required unless the add-on has attachments or created the post'),
        attachmentId: z.string().optional().describe('Required except for Attachment Discovery iframe'),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId, addOnToken, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/announcements/${itemId}/addOnContext`,
                { query: { addOnToken, attachmentId } },
            );
            if (!result.ok) return { error: 'Failed to get announcement add-on context', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting announcement add-on context', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteAnnouncementAddOnAttachment = tool({
    description: 'Deletes an add-on attachment from an announcement. The add-on must have created it.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Announcement ID'),
        attachmentId: z.string().describe('Attachment ID to delete'),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/announcements/${itemId}/addOnAttachments/${attachmentId}`,
                { method: 'DELETE' },
            );
            if (!result.ok) return { error: 'Failed to delete announcement add-on attachment', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting announcement add-on attachment', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getAnnouncementAddOnAttachment = tool({
    description: 'Gets an add-on attachment from an announcement. The requesting add-on must have created it.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Announcement ID'),
        attachmentId: z.string().describe('Attachment ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/announcements/${itemId}/addOnAttachments/${attachmentId}`,
            );
            if (!result.ok) return { error: 'Failed to get announcement add-on attachment', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting announcement add-on attachment', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAnnouncementAddOnAttachments = tool({
    description: 'Lists add-on attachments under an announcement. The add-on needs active attachments or create permission.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Announcement ID'),
        pageSize: z.number().min(1).max(20).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/announcements/${itemId}/addOnAttachments`,
                { query: { pageSize, pageToken } },
            );
            if (!result.ok) return { error: 'Failed to list announcement add-on attachments', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing announcement add-on attachments', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
