// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const deleteCourseWorkAddOnAttachment = tool({
    description: 'Deletes an add-on attachment from coursework. The add-on must have created it.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Coursework ID'),
        attachmentId: z.string().describe('Attachment ID to delete'),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${itemId}/addOnAttachments/${attachmentId}`,
                { method: 'DELETE' },
            );
            if (!result.ok) return { error: 'Failed to delete coursework add-on attachment', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting coursework add-on attachment', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourseWorkAddOnAttachment = tool({
    description: 'Gets an add-on attachment from coursework. The requesting add-on must have created it.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        postId: z.string().describe('Coursework ID containing the attachment'),
        attachmentId: z.string().describe('Attachment ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, postId, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${postId}/addOnAttachments/${attachmentId}`,
            );
            if (!result.ok) return { error: 'Failed to get coursework add-on attachment', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting coursework add-on attachment', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCourseWorkAddOnAttachments = tool({
    description: 'Lists add-on attachments on coursework created by the add-on.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        postId: z.string().describe('Coursework ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, postId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${postId}/addOnAttachments`,
            );
            if (!result.ok) return { error: 'Failed to list coursework add-on attachments', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing coursework add-on attachments', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getCourseWorkAddOnContext = tool({
    description: 'Gets add-on iframe metadata for coursework: user role, submission ID, grade support.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        itemId: z.string().describe('Coursework ID with the attached add-on'),
        addOnToken: z.string().optional(),
        attachmentId: z.string().optional().describe('Required except for Attachment Discovery iframe'),
    }),
    execute: async ({ googleClassroomToken, courseId, itemId, addOnToken, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/courseWork/${itemId}/addOnContext`,
                { query: { addOnToken, attachmentId } },
            );
            if (!result.ok) return { error: 'Failed to get coursework add-on context', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting coursework add-on context', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
