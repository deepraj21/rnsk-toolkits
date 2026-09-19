// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const createInvitation = tool({
    description: 'Invites a user to a course as a student or teacher.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        courseId: z.string(),
        userId: z.string().describe('Invitee user ID or email'),
        role: z.enum(['STUDENT', 'TEACHER']),
    }),
    execute: async ({ googleClassroomToken, courseId, userId, role }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, '/invitations', {
                method: 'POST',
                body: { courseId, userId, role },
            });
            if (!result.ok) return { error: 'Failed to create invitation', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating invitation', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const deleteInvitation = tool({
    description: 'Deletes an invitation. Confirm the invitation ID first.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        id: z.string().describe('Invitation ID to delete'),
    }),
    execute: async ({ googleClassroomToken, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/invitations/${id}`, { method: 'DELETE' });
            if (!result.ok) return { error: 'Failed to delete invitation', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error deleting invitation', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getInvitation = tool({
    description: 'Gets an invitation by ID.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        id: z.string().describe('Invitation ID'),
    }),
    execute: async ({ googleClassroomToken, id }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/invitations/${id}`);
            if (!result.ok) return { error: 'Failed to get invitation', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting invitation', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listInvitations = tool({
    description: 'Lists invitations you may view. At least one of userId or courseId is required.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        userId: z.string().optional().describe("Filter by user ('me', ID, or email)"),
        courseId: z.string().optional(),
        pageSize: z.number().min(1).optional(),
        pageToken: z.string().optional(),
    }),
    execute: async ({ googleClassroomToken, userId, courseId, pageSize, pageToken }) => {
        try {
            if (!userId && !courseId) return { error: 'At least one of userId or courseId must be supplied' };
            const result = await classroomRequest(googleClassroomToken, '/invitations', {
                query: { userId, courseId, pageSize, pageToken },
            });
            if (!result.ok) return { error: 'Failed to list invitations', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing invitations', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
