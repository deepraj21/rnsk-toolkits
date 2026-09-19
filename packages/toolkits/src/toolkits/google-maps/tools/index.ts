// @ts-nocheck
import {
    geocodeAddressWithQuery,
    geocodeDestinations,
    geocodePlace,
    geocodingApi,
    reverseGeocodeLocation,
} from './geocode.js';
import {
    embedGoogleMap,
    geolocateDevice,
    getTimeZone,
    lookupAerialVideo,
    renderAerialVideo,
} from './misc.js';
import {
    autocompletePlaces,
    getPlaceDetails,
    getPlacePhoto,
    nearbySearchPlaces,
    textSearchPlaces,
} from './places.js';
import { computeRouteMatrix, getRoute } from './routes.js';
import { createTilesSession, get2dTile, get3dTilesRoot } from './tiles.js';

export {
    autocompletePlaces,
    getPlaceDetails,
    textSearchPlaces,
    nearbySearchPlaces,
    getPlacePhoto,
    geocodeAddressWithQuery,
    geocodeDestinations,
    reverseGeocodeLocation,
    geocodePlace,
    geocodingApi,
    computeRouteMatrix,
    getRoute,
    createTilesSession,
    get2dTile,
    get3dTilesRoot,
    geolocateDevice,
    getTimeZone,
    embedGoogleMap,
    lookupAerialVideo,
    renderAerialVideo,
};

const auth = 'googleMapsToken' as const;

export const googleMapsTools = [
    { name: 'googleMapsAutocompletePlaces', description: 'Returns up to 5 as-you-type place/query predictions.', tool: autocompletePlaces, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGetPlaceDetails', description: 'Gets full details for a place ID with field selection.', tool: getPlaceDetails, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsTextSearchPlaces', description: 'Searches places by text query like "restaurants in London".', tool: textSearchPlaces, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsNearbySearchPlaces', description: 'Finds places in a circle by type filters.', tool: nearbySearchPlaces, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGetPlacePhoto', description: 'Downloads a place photo by photo resource name.', tool: getPlacePhoto, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGeocodeAddressWithQuery', description: 'Converts a full address string to coordinates.', tool: geocodeAddressWithQuery, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGeocodeDestinations', description: 'Returns rich destination data (places, entrances, navigation points).', tool: geocodeDestinations, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsReverseGeocodeLocation', description: 'Converts coordinates to addresses.', tool: reverseGeocodeLocation, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGeocodePlace', description: 'Looks up address and coordinates for a place ID.', tool: geocodePlace, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGeocodingApi', description: 'Unified forward/reverse/place-ID geocoder (exactly one mode).', tool: geocodingApi, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsComputeRouteMatrix', description: 'Computes distance/duration for every origin×destination pair.', tool: computeRouteMatrix, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGetRoute', description: 'Computes routes with waypoints and travel preferences.', tool: getRoute, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsCreateTilesSession', description: 'Creates a session token for 2D tiles and Street View.', tool: createTilesSession, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGet2dTile', description: 'Downloads one 2D tile image by zoom/column/row.', tool: get2dTile, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGet3dTilesRoot', description: 'Gets the photorealistic 3D tileset root for renderers.', tool: get3dTilesRoot, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGeolocateDevice', description: 'Estimates device location from cell towers and WiFi.', tool: geolocateDevice, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsGetTimeZone', description: 'Gets DST-aware time zone info for coordinates.', tool: getTimeZone, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsEmbedGoogleMap', description: 'Builds a public Maps Embed URL + iframe (API key only, no call made).', tool: embedGoogleMap, scope: 'read' as const },
    { name: 'googleMapsLookupAerialVideo', description: 'Looks up an aerial video by address or video ID.', tool: lookupAerialVideo, requiredAuth: auth, scope: 'read' as const },
    { name: 'googleMapsRenderAerialVideo', description: 'Starts an aerial video render for a US address.', tool: renderAerialVideo, requiredAuth: auth, scope: 'write' as const },
];
