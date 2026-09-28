// @ts-nocheck
import {
  createBoard,
  createBoardSection,
  deleteBoard,
  deleteBoardSection,
  getBoard,
  listBoardPins,
  listBoards,
  listBoardSections,
  listSectionPins,
  updateBoard,
  updateBoardSection,
} from './boards.js';
import {
  createPin,
  deletePin,
  getMultiPinAnalytics,
  getPin,
  getPinAnalytics,
  listPins,
  savePin,
  updatePin,
} from './pins.js';
import { followUser, getProfile, getWebsiteVerification, listProfileResources } from './user.js';
import { getMedia, listMedia, registerMedia, searchOwnContent } from './media.js';
import { getAccountAnalytics, getTopPins } from './analytics.js';
import { getInspirationTrends, getKeywordTrends, getProductTrends } from './trends.js';

export {
  listBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  listBoardSections,
  createBoardSection,
  updateBoardSection,
  deleteBoardSection,
  listBoardPins,
  listSectionPins,
  listPins,
  getPin,
  createPin,
  updatePin,
  deletePin,
  savePin,
  getPinAnalytics,
  getMultiPinAnalytics,
  getProfile,
  listProfileResources,
  followUser,
  getWebsiteVerification,
  registerMedia,
  getMedia,
  listMedia,
  searchOwnContent,
  getAccountAnalytics,
  getTopPins,
  getKeywordTrends,
  getInspirationTrends,
  getProductTrends,
};

const auth = 'pinterestToken' as const;

type Scope = 'read' | 'write' | 'delete';
function entry(
  name: string,
  description: string,
  toolRef: any,
  scope: Scope,
  keywords: string[] = [],
): {
  name: string;
  description: string;
  tool: any;
  requiredAuth: typeof auth;
  scope: Scope;
  keywords: string[];
} {
  return { name, description, tool: toolRef, requiredAuth: auth, scope, keywords };
}

export const pinterestTools = [
  entry(
    'pinterestListBoards',
    'List boards (public, protected, secret) one page at a time. Start here for board IDs.',
    listBoards,
    'read',
  ),
  entry('pinterestGetBoard', 'Get one board by ID, including secret boards.', getBoard, 'read'),
  entry('pinterestCreateBoard', 'Create a public or secret board.', createBoard, 'write'),
  entry(
    'pinterestUpdateBoard',
    'Update a board name, description, or privacy.',
    updateBoard,
    'write',
    ['rename', 'edit'],
  ),
  entry('pinterestDeleteBoard', 'Permanently delete a board by ID.', deleteBoard, 'delete', [
    'remove',
  ]),
  entry('pinterestListBoardSections', 'List sections within a board.', listBoardSections, 'read'),
  entry(
    'pinterestCreateBoardSection',
    'Create a named section within a board.',
    createBoardSection,
    'write',
  ),
  entry(
    'pinterestUpdateBoardSection',
    'Rename a section within a board.',
    updateBoardSection,
    'write',
  ),
  entry(
    'pinterestDeleteBoardSection',
    'Permanently delete a section from a board.',
    deleteBoardSection,
    'delete',
    ['remove'],
  ),
  entry(
    'pinterestListBoardPins',
    'List Pins on a board with creative-type and metrics filters.',
    listBoardPins,
    'read',
  ),
  entry('pinterestListSectionPins', 'List Pins in a board section.', listSectionPins, 'read'),
  entry(
    'pinterestListPins',
    'List account Pins with creative-type and metrics filters.',
    listPins,
    'read',
    ['pin'],
  ),
  entry('pinterestGetPin', 'Get one Pin by ID, with optional metrics.', getPin, 'read', ['pin']),
  entry(
    'pinterestCreatePin',
    'Create an image, carousel, or registered-video Pin on a board.',
    createPin,
    'write',
    ['pin', 'post', 'upload'],
  ),
  entry('pinterestUpdatePin', 'Update content on an owned Pin or move it.', updatePin, 'write', [
    'pin',
    'edit',
  ]),
  entry('pinterestDeletePin', 'Permanently delete a Pin by ID.', deletePin, 'delete', [
    'pin',
    'remove',
  ]),
  entry('pinterestSavePin', 'Save (repin) a Pin to one of your boards.', savePin, 'write', ['pin']),
  entry(
    'pinterestGetPinAnalytics',
    'Get daily, summary, and lifetime analytics for one Pin.',
    getPinAnalytics,
    'read',
    ['pin', 'stats', 'metrics', 'insights'],
  ),
  entry(
    'pinterestGetMultiPinAnalytics',
    'Get analytics for up to 100 Pins in one call.',
    getMultiPinAnalytics,
    'read',
    ['pins', 'stats', 'bulk'],
  ),
  entry(
    'pinterestGetProfile',
    'Get the connected account profile and content counts.',
    getProfile,
    'read',
    ['account'],
  ),
  entry(
    'pinterestListProfileResources',
    'List followers, followed users/boards/interests, websites, or linked businesses.',
    listProfileResources,
    'read',
    ['follower', 'following'],
  ),
  entry('pinterestFollowUser', 'Follow a Pinterest user by username.', followUser, 'write'),
  entry(
    'pinterestGetWebsiteVerification',
    'Get website-claim verification material.',
    getWebsiteVerification,
    'read',
    ['verify', 'domain'],
  ),
  entry(
    'pinterestRegisterMedia',
    'Register a video upload; returns media ID, upload URL, and parameters.',
    registerMedia,
    'write',
  ),
  entry('pinterestGetMedia', 'Get a registered video upload/processing status.', getMedia, 'read'),
  entry('pinterestListMedia', 'List media uploads registered by the account.', listMedia, 'read', [
    'video',
    'videos',
  ]),
  entry(
    'pinterestSearchOwnContent',
    "Search the account's own boards or Pins (incl. secret content).",
    searchOwnContent,
    'read',
  ),
  entry(
    'pinterestGetAccountAnalytics',
    'Get aggregate account analytics over a UTC date range.',
    getAccountAnalytics,
    'read',
    ['stats', 'metrics', 'insights', 'performance'],
  ),
  entry(
    'pinterestGetTopPins',
    'Get top regular or video Pins ranked by an analytics metric.',
    getTopPins,
    'read',
    ['popular', 'best', 'pins'],
  ),
  entry(
    'pinterestGetKeywordTrends',
    'Get top growing/monthly/yearly/seasonal search keywords for a market.',
    getKeywordTrends,
    'read',
    ['trending'],
  ),
  entry(
    'pinterestGetInspirationTrends',
    'Get editorial trend articles or featured trend topics for a region.',
    getInspirationTrends,
    'read',
    ['trending', 'ideas'],
  ),
  entry(
    'pinterestGetProductTrends',
    'Discover growing shopping categories or inspect category trend metrics.',
    getProductTrends,
    'read',
    ['trending'],
  ),
];
