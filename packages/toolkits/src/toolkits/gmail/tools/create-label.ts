import { tool } from 'ai';
import { z } from 'zod';

const visibilitySchema = z.enum(['labelShow', 'labelShowIfUnread', 'labelHide']).optional();
const messageVisibilitySchema = z.enum(['show', 'hide']).optional();

export const createLabel = tool({
    description: 'Create a new user label in Gmail.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        labelName: z.string().min(1).describe('Display name for the new label'),
        labelListVisibility: visibilitySchema.describe('How the label appears in the label list'),
        messageListVisibility: messageVisibilitySchema.describe('How messages with this label appear in message lists'),
        textColor: z.string().optional().describe('Optional label text color hex code'),
        backgroundColor: z.string().optional().describe('Optional label background color hex code'),
    }),
    execute: async ({ gmailToken, labelName, labelListVisibility, messageListVisibility, textColor, backgroundColor }) => {
        try {
            const color = textColor || backgroundColor ? { textColor, backgroundColor } : undefined;
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: labelName,
                    labelListVisibility,
                    messageListVisibility,
                    color,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to create label', details: error };
            }

            const data = await response.json();
            return { success: true, label: data };
        } catch (error) {
            return {
                error: 'Error creating label',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
