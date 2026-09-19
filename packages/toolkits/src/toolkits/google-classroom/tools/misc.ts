// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { classroomRequest, googleClassroomTokenField } from './client.js';

export const createRegistration = tool({
    description: 'Subscribes a Cloud Pub/Sub topic to Classroom push notifications (roster or coursework changes). Requires push-notifications scope.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        feed: z.object({
            feedType: z.enum(['DOMAIN_ROSTER_CHANGES', 'COURSE_ROSTER_CHANGES', 'COURSE_WORK_CHANGES']),
            courseRosterChangesInfo: z.object({ courseId: z.string() }).optional().describe('Required for COURSE_ROSTER_CHANGES'),
            courseWorkChangesInfo: z.object({ courseId: z.string() }).optional().describe('Required for COURSE_WORK_CHANGES'),
        }),
        cloudPubsubTopic: z.object({
            topicName: z.string().describe("Topic 'projects/{project}/topics/{topic}' (Classroom needs publish rights)"),
        }),
    }),
    execute: async ({ googleClassroomToken, feed, cloudPubsubTopic }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, '/registrations', {
                method: 'POST',
                body: { feed, cloudPubsubTopic },
            });
            if (!result.ok) return { error: 'Failed to create registration', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error creating registration', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getUserProfile = tool({
    description: 'Gets a user profile (name, email, photo, permissions) by ID, email, or me.',
    inputSchema: z.object({
        googleClassroomToken: googleClassroomTokenField,
        userId: z.string().describe("User ID, email, or 'me'"),
    }),
    execute: async ({ googleClassroomToken, userId }) => {
        try {
            const result = await classroomRequest(googleClassroomToken, `/userProfiles/${userId}`);
            if (!result.ok) return { error: 'Failed to get user profile', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting user profile', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
