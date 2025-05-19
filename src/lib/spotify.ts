import SpotifyWebApi from "spotify-web-api-node";

// Initialize the Spotify API with credentials
export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Set the access token for the API
export const setAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
};

// Search for tracks
export const searchTracks = async (query: string, limit = 10) => {
  try {
    const response = await spotifyApi.searchTracks(query, { limit });
    return response.body.tracks?.items || [];
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
};

// Get audio features for a track
export const getAudioFeatures = async (trackId: string) => {
  try {
    const response = await spotifyApi.getAudioFeaturesForTrack(trackId);
    return response.body;
  } catch (error) {
    console.error("Error getting audio features:", error);
    return null;
  }
};

// Get audio features for multiple tracks
export const getAudioFeaturesForTracks = async (trackIds: string[]) => {
  try {
    const response = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    return response.body.audio_features;
  } catch (error) {
    console.error("Error getting audio features for tracks:", error);
    return [];
  }
};

// Get recommendations based on seed tracks
export const getRecommendations = async (
  seedTracks: string[],
  limit = 10,
  options = {}
) => {
  try {
    // Limit seed tracks to 5 (Spotify API limitation)
    const limitedSeeds = seedTracks.slice(0, 5);
    
    const response = await spotifyApi.getRecommendations({
      seed_tracks: limitedSeeds,
      limit,
      ...options,
    });
    
    return response.body.tracks || [];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};

// Calculate similarity between two tracks based on audio features
export const calculateSimilarity = (
  track1Features: SpotifyApi.AudioFeaturesObject,
  track2Features: SpotifyApi.AudioFeaturesObject
) => {
  // Features to compare
  const features = [
    "danceability",
    "energy",
    "valence",
    "tempo",
    "acousticness",
    "instrumentalness",
  ] as const;
  
  // Normalize tempo to 0-1 range (assuming tempo ranges from 0-250)
  const normalizeTempo = (tempo: number) => Math.min(tempo / 250, 1);
  
  let totalDiff = 0;
  const featureDiffs: Record<string, number> = {};
  
  // Calculate difference for each feature
  features.forEach((feature) => {
    let value1 = track1Features[feature];
    let value2 = track2Features[feature];
    
    // Normalize tempo
    if (feature === "tempo") {
      value1 = normalizeTempo(value1);
      value2 = normalizeTempo(value2);
    }
    
    const diff = Math.abs(value1 - value2);
    featureDiffs[`${feature}Diff`] = diff;
    totalDiff += diff;
  });
  
  // Calculate similarity score (1 = identical, 0 = completely different)
  const similarityScore = 1 - totalDiff / features.length;
  
  return {
    similarityScore,
    ...featureDiffs,
  };
}; 