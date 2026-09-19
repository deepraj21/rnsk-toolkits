// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { discordApi, toDiscordError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

const permissionOverride = z.object({
    id: z.string().describe('Role, user, or channel ID'),
    type: z.number().describe('1 = role, 2 = user, 3 = channel'),
    permission: z.boolean().describe('True to allow, false to disallow'),
});

export const discordEditCommandPermissions = tool({
    description:
        'Set permission overrides for an application command in a guild. Needs an OAuth2 Bearer token (bot tokens error) and MANAGE_GUILD + MANAGE_ROLES for the authorizing user.',
    inputSchema: z.object({
        discordToken: tokenField,
        applicationId: z.string().describe('Application snowflake ID'),
        guildId: z.string().describe('Guild snowflake ID'),
        commandId: z.string().describe('Application command snowflake ID'),
        permissions: z.array(permissionOverride).describe('Permission overrides to set'),
    }),
    execute: async ({ discordToken, applicationId, guildId, commandId, permissions }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(
                discordToken,
                'PUT',
                `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`,
                { body: { permissions } },
            );
        } catch (error) {
            return toDiscordError(error, 'Failed to edit command permissions');
        }
    },
});

export const discordGetCommandPermissions = tool({
    description:
        'Get permission overrides for one application command in a guild. Needs an OAuth2 Bearer token (bot tokens error).',
    inputSchema: z.object({
        discordToken: tokenField,
        applicationId: z.string().describe('Application snowflake ID'),
        guildId: z.string().describe('Guild snowflake ID'),
        commandId: z.string().describe('Application command snowflake ID'),
    }),
    execute: async ({ discordToken, applicationId, guildId, commandId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(
                discordToken,
                'GET',
                `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`,
            );
        } catch (error) {
            return toDiscordError(error, 'Failed to get command permissions');
        }
    },
});

export const discordGetBatchCommandPermissions = tool({
    description:
        'Get permission overrides for all commands of an application in a guild. Needs an OAuth2 Bearer token (bot tokens error).',
    inputSchema: z.object({
        discordToken: tokenField,
        applicationId: z.string().describe('Application snowflake ID'),
        guildId: z.string().describe('Guild snowflake ID'),
    }),
    execute: async ({ discordToken, applicationId, guildId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            const permissions = await discordApi(
                discordToken,
                'GET',
                `/applications/${applicationId}/guilds/${guildId}/commands/permissions`,
            );
            return { command_permissions: permissions };
        } catch (error) {
            return toDiscordError(error, 'Failed to get command permissions');
        }
    },
});

export const discordGetMyEntitlements = tool({
    description:
        'List the caller entitlements for an application, with pagination and SKU filters. guild_id is filtered locally since the route has no such filter.',
    inputSchema: z.object({
        discordToken: tokenField,
        applicationId: z.string().describe('Application snowflake ID'),
        skuIds: z.array(z.string()).optional().describe('Filter to these SKU IDs'),
        guildId: z.string().optional().describe('Keep only entitlements granted for this guild'),
        limit: z.number().min(1).max(100).optional().describe('Max entitlements (1-100, default 100)'),
        before: z.string().optional().describe('Entitlements before this entitlement ID'),
        after: z.string().optional().describe('Entitlements after this entitlement ID'),
        excludeEnded: z.boolean().optional().describe('Omit ended entitlements'),
        excludeDeleted: z.boolean().optional().describe('Omit deleted entitlements (default true)'),
    }),
    execute: async ({ discordToken, applicationId, skuIds, guildId, limit, before, after, excludeEnded, excludeDeleted }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            const entitlements = await discordApi(
                discordToken,
                'GET',
                `/users/@me/applications/${applicationId}/entitlements`,
                {
                    query: {
                        sku_ids: skuIds,
                        limit,
                        before,
                        after,
                        exclude_ended: excludeEnded,
                        exclude_deleted: excludeDeleted,
                    },
                },
            );
            const list = Array.isArray(entitlements) ? entitlements : [];
            return { entitlements: guildId ? list.filter((e) => e?.guild_id === guildId) : list };
        } catch (error) {
            return toDiscordError(error, 'Failed to get entitlements');
        }
    },
});

export const discordGetRoleConnection = tool({
    description:
        'Get the caller application role connection (platform name/username, metadata) for an application. Needs role_connections.write.',
    inputSchema: z.object({
        discordToken: tokenField,
        applicationId: z.string().describe('Application snowflake ID'),
    }),
    execute: async ({ discordToken, applicationId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', `/users/@me/applications/${applicationId}/role-connection`);
        } catch (error) {
            return toDiscordError(error, 'Failed to get role connection');
        }
    },
});

export const discordUpdateRoleConnection = tool({
    description:
        'Update the caller application role connection (platform name/username, string-ified metadata). Needs role_connections.write.',
    inputSchema: z.object({
        discordToken: tokenField,
        applicationId: z.string().describe('Application snowflake ID'),
        platformName: z.string().optional().describe('Platform vanity name (max 50 chars)'),
        platformUsername: z.string().optional().describe('Platform username (max 100 chars)'),
        metadata: z.record(z.string()).optional().describe('Metadata keys mapped to string values'),
    }),
    execute: async ({ discordToken, applicationId, platformName, platformUsername, metadata }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'PUT', `/users/@me/applications/${applicationId}/role-connection`, {
                body: {
                    platform_name: platformName,
                    platform_username: platformUsername,
                    metadata,
                },
            });
        } catch (error) {
            return toDiscordError(error, 'Failed to update role connection');
        }
    },
});

export const discordDeleteRoleConnection = tool({
    description:
        'Delete the caller application role connection for an application, removing platform metadata. Confirm with the user first.',
    inputSchema: z.object({
        discordToken: tokenField,
        applicationId: z.string().describe('Application snowflake ID'),
    }),
    execute: async ({ discordToken, applicationId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            await discordApi(discordToken, 'DELETE', `/users/@me/applications/${applicationId}/role-connection`);
            return { success: true, application_id: applicationId };
        } catch (error) {
            return toDiscordError(error, 'Failed to delete role connection');
        }
    },
});

export const discordGetSkuSubscription = tool({
    description:
        'Get one subscription by ID for a SKU, including status and current period.',
    inputSchema: z.object({
        discordToken: tokenField,
        skuId: z.string().describe('SKU ID the subscription belongs to'),
        subscriptionId: z.string().describe('Subscription ID to retrieve'),
    }),
    execute: async ({ discordToken, skuId, subscriptionId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', `/skus/${skuId}/subscriptions/${subscriptionId}`);
        } catch (error) {
            return toDiscordError(error, 'Failed to get SKU subscription');
        }
    },
});

export const discordListSkuSubscriptions = tool({
    description:
        'List subscriptions for a SKU with pagination. user_id filter is for bot tokens; omit it for OAuth2 user connections.',
    inputSchema: z.object({
        discordToken: tokenField,
        skuId: z.string().describe('SKU ID to list subscriptions for'),
        limit: z.number().min(1).max(100).optional().describe('Max subscriptions (1-100, default 100)'),
        before: z.string().optional().describe('Subscriptions before this subscription ID'),
        after: z.string().optional().describe('Subscriptions after this subscription ID'),
        userId: z.string().optional().describe('Filter by user ID (bot tokens only)'),
    }),
    execute: async ({ discordToken, skuId, userId, ...rest }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            const subscriptions = await discordApi(discordToken, 'GET', `/skus/${skuId}/subscriptions`, {
                query: { ...rest, user_id: userId },
            });
            return { subscriptions };
        } catch (error) {
            return toDiscordError(error, 'Failed to list SKU subscriptions');
        }
    },
});
