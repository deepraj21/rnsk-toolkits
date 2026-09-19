// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

const assigneeMode = z.enum(['ALL_STUDENTS', 'INDIVIDUAL_STUDENTS']);
const materialSchema = z.record(z.any()).describe('Material with exactly one of driveFile, link, form, youtubeVideo');
const individualStudentsOptions = z.object({
    studentIds: z.array(z.string()).describe('Students who can see the item'),
});

export const createAnnouncement = tool({
    description: 'Creates an announcement (draft, published, or scheduled) in a course.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        text: z.string().optional().describe('Announcement text'),
        materials: z.array(materialSchema).optional(),
        state: z.enum(['DRAFT', 'PUBLISHED', 'DELETED']).optional().describe('Defaults to PUBLISHED'),
        scheduledTime: z.string().optional().describe('RFC3339 publish time'),
        assigneeMode: assigneeMode.optional(),
        individualStudentsOptions: individualStudentsOptions.optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, ...body }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/announcements`, {
                method: 'POST',
                body,
            });
            if (!result.ok) return { error: 'Failed to create announcement', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating announcement', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteAnnouncement = tool({
    description: 'Deletes an announcement. Confirm the announcement ID first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        id: z.string().describe('Announcement ID to delete'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/announcements/${id}`, {
                method: 'DELETE',
            });
            if (!result.ok) return { error: 'Failed to delete announcement', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting announcement', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getAnnouncement = tool({
    description: 'Fetches an announcement by course and announcement ID.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Announcement ID'),
    }),
    execute: async ({ googleClassroomToken, courseId, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/announcements/${id}`);
            if (!result.ok) return { error: 'Failed to get announcement', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting announcement', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAnnouncements = tool({
    description: 'Pages through announcements in a course, newest or oldest first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        orderBy: z.enum(['updateTime asc', 'updateTime desc']).optional().describe('Sort order (default updateTime desc)'),
        pageSize: z.number().min(1).max(100).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, orderBy, pageSize, pageToken }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/announcements`, {
                query: { orderBy, pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list announcements', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing announcements', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const modifyAnnouncementAssignees = tool({
    description: 'Changes who can view an announcement: all students or add/remove individual students.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string().describe('Course ID or alias'),
        id: z.string().describe('Announcement ID'),
        assigneeMode: assigneeMode,
        modifyIndividualStudentsOptions: z.object({
            addStudentIds: z.array(z.string()).optional(),
            removeStudentIds: z.array(z.string()).optional(),
        }).optional().describe('Student changes for INDIVIDUAL_STUDENTS mode'),
    }),
    execute: async ({ googleClassroomToken, courseId, id, ...body }) => {
        try {
            const result = await classroomRequest(
                googleClassroomToken,
                `/courses/${courseId}/announcements/${id}:modifyAssignees`,
                { method: 'POST', body },
            );
            if (!result.ok) return { error: 'Failed to modify announcement assignees', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error modifying announcement assignees', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const patchAnnouncement = tool({
    description: 'Updates announcement fields. Only fields in updateMask change (e.g. text,scheduledTime).',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        id: z.string().describe('Announcement ID to update'),
        updateMask: z.string().describe("Fields to update, e.g. 'text,state'"),
        text: z.string().optional(),
        materials: z.array(materialSchema).optional(),
        state: z.enum(['DRAFT', 'PUBLISHED', 'DELETED']).optional(),
        scheduledTime: z.string().optional().describe('RFC3339 publish time'),
        assigneeMode: assigneeMode.optional(),
        individualStudentsOptions: individualStudentsOptions.optional(),
    }),
    execute: async ({ googleClassroomToken, courseId, id, updateMask, ...fields }) => {
        try {
            const body: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(fields)) if (v !== undefined) body[k] = v;
            const result = await classroomRequest(googleClassroomToken, `/courses/${courseId}/announcements/${id}`, {
                method: 'PATCH',
                query: { updateMask },
                body,
            });
            if (!result.ok) return { error: 'Failed to patch announcement', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error patching announcement', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
