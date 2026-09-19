// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const listPostAddOnAttachments = tool({
    description: 'Lists add-on attachments on a post (announcement, coursework, or material). The add-on needs active attachments or create permission.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        postId: z.string().describe('Post ID under the course'),
        itemId: z.string().optional().describe('Item ID enumerating attachments for (optional query param)'),
        pageSize: z.number().min(1).max(20).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, postId, itemId, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/posts/${postId}/addOnAttachments`,
                { query: { itemId, pageSize, pageToken } },
            );
            if (!result.ok) return { error: 'Failed to list post add-on attachments', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing post add-on attachments', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getPostAddOnContext = tool({
    description: 'Gets add-on iframe metadata for a post: user role (exactly one of student/teacher context), submission ID, grade support.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        postId: z.string().describe('Post ID (path, deprecated but required)'),
        itemId: z.string().describe('Item ID with the attached add-on'),
        addOnToken: z.string().optional(),
        attachmentId: z.string().optional().describe('Required except for Attachment Discovery iframe'),
    }),
    execute: async ({ googleClassroomToken, courseId, postId, itemId, addOnToken, attachmentId }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/posts/${postId}/addOnContext`,
                { query: { itemId, addOnToken, attachmentId } },
            );
            if (!result.ok) return { error: 'Failed to get post add-on context', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting post add-on context', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
