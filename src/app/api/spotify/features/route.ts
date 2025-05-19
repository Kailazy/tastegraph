import { NextRequest, NextResponse } from "next/server";
import { spotifyApi, getAudioFeatures, getAudioFeaturesForTracks } from "@/lib/spotify";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Spotify." },
        { status: 401 }
      );
    }
    
    // Get track ID from query parameters
    const url = new URL(request.url);
    const trackId = url.searchParams.get("trackId");
    const trackIds = url.searchParams.get("trackIds");
    
    if (!trackId && !trackIds) {
      return NextResponse.json(
        { error: "Either 'trackId' or 'trackIds' parameter is required" },
        { status: 400 }
      );
    }
    
    // Set access token from session
    spotifyApi.setAccessToken(session.accessToken);
    
    let features;
    
    if (trackId) {
      // Get features for a single track
      features = await getAudioFeatures(trackId);
    } else if (trackIds) {
      // Get features for multiple tracks
      const ids = trackIds.split(",");
      features = await getAudioFeaturesForTracks(ids);
    }
    
    return NextResponse.json({ features });
  } catch (error) {
    console.error("Error in features route:", error);
    return NextResponse.json(
      { error: "Failed to get audio features" },
      { status: 500 }
    );
  }
} 