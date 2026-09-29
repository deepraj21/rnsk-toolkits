// @ts-nocheck
import {
  dribbbleCreateShot,
  dribbbleDeleteShot,
  dribbbleGetMyShot,
  dribbbleListMyShots,
  dribbbleUpdateShot,
} from './shots.js';
import { dribbbleDeleteShotAttachment, dribbbleUploadShotAttachment } from './attachments.js';
import {
  dribbbleCreateProject,
  dribbbleDeleteProject,
  dribbbleListMyProjects,
  dribbbleUpdateProject,
} from './projects.js';
import { dribbbleGetCurrentUser } from './user.js';

export {
  dribbbleCreateShot,
  dribbbleDeleteShot,
  dribbbleGetMyShot,
  dribbbleListMyShots,
  dribbbleUpdateShot,
  dribbbleDeleteShotAttachment,
  dribbbleUploadShotAttachment,
  dribbbleCreateProject,
  dribbbleDeleteProject,
  dribbbleListMyProjects,
  dribbbleUpdateProject,
  dribbbleGetCurrentUser,
};

const auth = 'dribbbleToken' as const;

export const dribbbleTools = [
  {
    name: 'dribbbleCreateShot',
    description: dribbbleCreateShot.description!,
    tool: dribbbleCreateShot,
    requiredAuth: auth,
    scope: 'write' as const,
    keywords: ['upload', 'publish', 'artwork'],
  },
  {
    name: 'dribbbleGetMyShot',
    description: dribbbleGetMyShot.description!,
    tool: dribbbleGetMyShot,
    requiredAuth: auth,
    scope: 'read' as const,
    keywords: ['retrieve', 'artwork'],
  },
  {
    name: 'dribbbleListMyShots',
    description: dribbbleListMyShots.description!,
    tool: dribbbleListMyShots,
    requiredAuth: auth,
    scope: 'read' as const,
    keywords: ['portfolio', 'artworks'],
  },
  {
    name: 'dribbbleUpdateShot',
    description: dribbbleUpdateShot.description!,
    tool: dribbbleUpdateShot,
    requiredAuth: auth,
    scope: 'write' as const,
    keywords: ['edit', 'metadata', 'rebound'],
  },
  {
    name: 'dribbbleDeleteShot',
    description: dribbbleDeleteShot.description!,
    tool: dribbbleDeleteShot,
    requiredAuth: auth,
    scope: 'delete' as const,
    keywords: ['remove', 'permanent'],
  },
  {
    name: 'dribbbleUploadShotAttachment',
    description: dribbbleUploadShotAttachment.description!,
    tool: dribbbleUploadShotAttachment,
    requiredAuth: auth,
    scope: 'write' as const,
    keywords: ['attach', 'file'],
  },
  {
    name: 'dribbbleDeleteShotAttachment',
    description: dribbbleDeleteShotAttachment.description!,
    tool: dribbbleDeleteShotAttachment,
    requiredAuth: auth,
    scope: 'delete' as const,
    keywords: ['remove', 'file'],
  },
  {
    name: 'dribbbleCreateProject',
    description: dribbbleCreateProject.description!,
    tool: dribbbleCreateProject,
    requiredAuth: auth,
    scope: 'write' as const,
    keywords: ['collection', 'album', 'new'],
  },
  {
    name: 'dribbbleListMyProjects',
    description: dribbbleListMyProjects.description!,
    tool: dribbbleListMyProjects,
    requiredAuth: auth,
    scope: 'read' as const,
    keywords: ['collections', 'albums'],
  },
  {
    name: 'dribbbleUpdateProject',
    description: dribbbleUpdateProject.description!,
    tool: dribbbleUpdateProject,
    requiredAuth: auth,
    scope: 'write' as const,
    keywords: ['rename', 'edit'],
  },
  {
    name: 'dribbbleDeleteProject',
    description: dribbbleDeleteProject.description!,
    tool: dribbbleDeleteProject,
    requiredAuth: auth,
    scope: 'delete' as const,
    keywords: ['remove', 'collection'],
  },
  {
    name: 'dribbbleGetCurrentUser',
    description: dribbbleGetCurrentUser.description!,
    tool: dribbbleGetCurrentUser,
    requiredAuth: auth,
    scope: 'read' as const,
    keywords: ['profile', 'me', 'account'],
  },
];
