// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloSearch = tool({
  description:
    'Searches Trello for boards, cards, members, and workspaces matching a query. Scope results with modelTypes (boards, cards, members, organizations) and limit each with boardsLimit / cardsLimit. Supports Trello’s query modifiers like is:open and has:attachment.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    query: z.string().min(1).describe('Search text; supports modifiers such as "is:starred"'),
    modelTypes: z
      .string()
      .optional()
      .describe('Comma-separated: "boards", "cards", "members", "organizations", or "all"'),
    idBoards: z
      .string()
      .optional()
      .describe('Restrict to these board ids, or the literal "mine" for your boards'),
    idCards: z.string().optional().describe('Restrict to these card ids'),
    idOrganizations: z.string().optional().describe('Restrict to these workspace ids'),
    boardsLimit: z.number().min(1).max(1000).optional().describe('Max boards (default 10)'),
    cardsLimit: z.number().min(1).max(1000).optional().describe('Max cards (default 10)'),
    cardsPage: z.number().min(0).max(100).optional().describe('Card results page (default 0)'),
    membersLimit: z.number().min(1).max(1000).optional().describe('Max members (default 10)'),
    partial: z.boolean().optional().describe('Match on partial words'),
  }),
  execute: async ({
    trelloCredentials,
    query,
    modelTypes,
    idBoards,
    idCards,
    idOrganizations,
    boardsLimit,
    cardsLimit,
    cardsPage,
    membersLimit,
    partial,
  }) => {
    if (!query) return { error: 'query is required.' };

    const result = await trelloRequest(trelloCredentials, '/search', {
      query: {
        query,
        modelTypes,
        idBoards,
        idCards,
        idOrganizations,
        boards_limit: boardsLimit,
        cards_limit: cardsLimit,
        cards_page: cardsPage,
        members_limit: membersLimit,
        partial,
      },
    });
    if (result.error) return result;

    const data = result.data;
    return {
      boards: asList(data?.boards),
      cards: asList(data?.cards),
      members: asList(data?.members),
      organizations: asList(data?.organizations ?? data?.workspaces),
    };
  },
});
