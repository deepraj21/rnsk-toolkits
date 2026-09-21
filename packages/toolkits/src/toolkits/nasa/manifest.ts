import { defineToolkit, defineTool } from '../../core/define.js';
import { NASA_ICON } from './icon.js';
import { nasaTools } from './tools/index.js';

export default defineToolkit({
  id: 'nasa',
  displayName: 'NASA',
  shortDescription: 'Asteroids, APOD, space weather, Earth imagery, science datasets, and publications.',
  category: 'Analytics & Data',
  icon: NASA_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'nasaApiKey',
    provider: {
      in: 'query',
      name: 'api_key',
      connectDescription:
        'Connect NASA with an api.nasa.gov API key (get a free key at https://api.nasa.gov). The key is sent as the api_key query parameter on api.nasa.gov endpoints (NeoWs, APOD, DONKI, Mars photos, EPIC, TechPort). All other NASA services in this toolkit (EONET, CMR, NTRS, OSDR, SSC, POWER, OpenAltimetry, image library, AGAGE, TOLNet, SVS) are keyless and need no connection.',
    },
  },
  allowedHosts: [
    'api.nasa.gov',
    'exoplanetarchive.ipac.caltech.edu',
    'eonet.gsfc.nasa.gov',
    'cmr.earthdata.nasa.gov',
    'graphql.earthdata.nasa.gov',
    'ntrs.nasa.gov',
    'osdr.nasa.gov',
    'sscweb.gsfc.nasa.gov',
    'power.larc.nasa.gov',
    'openaltimetry.earthdatacloud.nasa.gov',
    'images-api.nasa.gov',
    'svs.gsfc.nasa.gov',
    'www-air.larc.nasa.gov',
    'tolnet.larc.nasa.gov',
  ],
  tools: nasaTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: (entry as { requiredAuth?: 'nasaApiKey' }).requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.10',
    homepage: 'https://api.nasa.gov',
    docsUrl: 'https://api.nasa.gov',
    apiDocsUrl: 'https://api.nasa.gov',
  },
});
