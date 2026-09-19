import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GCLASSROOM_ICON } from './icon.js';
import { googleClassroomTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-classroom',
  displayName: 'Google Classroom',
  shortDescription: 'Manage courses, coursework, rosters, announcements, and grades in Google Classroom.',
  category: 'Education & LMS',
  icon: GCLASSROOM_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleClassroomToken',
    provider: {
      slug: 'google-classroom',
      env: { clientId: 'GOOGLE_CLASSROOM_CLIENT_ID', clientSecret: 'GOOGLE_CLASSROOM_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/classroom.courses',
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.rosters',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.profile.emails',
        'https://www.googleapis.com/auth/classroom.profile.photos',
        'https://www.googleapis.com/auth/classroom.coursework.me',
        'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
        'https://www.googleapis.com/auth/classroom.courseworkmaterials',
        'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.announcements.readonly',
        'https://www.googleapis.com/auth/classroom.topics',
        'https://www.googleapis.com/auth/classroom.topics.readonly',
        'https://www.googleapis.com/auth/classroom.guardianlinks.students',
        'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
        'https://www.googleapis.com/auth/classroom.guardians',
        'https://www.googleapis.com/auth/classroom.guardians.readonly',
        'https://www.googleapis.com/auth/classroom.addons.student',
        'https://www.googleapis.com/auth/classroom.addons.teacher',
        'https://www.googleapis.com/auth/classroom.push-notifications',
        'https://www.googleapis.com/auth/classroom.invitations',
        'https://www.googleapis.com/auth/classroom.invitations.readonly',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Classroom to manage courses, coursework, rosters, and announcements.',
      callbackPath: '/api/auth/google-classroom/callback',
      stateCookie: 'google_classroom_oauth_state',
    },
  },
  allowedHosts: ['classroom.googleapis.com'],
  tools: googleClassroomTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.8',
    homepage: 'https://classroom.google.com',
    docsUrl: 'https://developers.google.com/classroom',
  },
});
