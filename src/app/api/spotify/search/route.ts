import { NextRequest, NextResponse } from "next/server";
import { spotifyApi, searchTracks } from "@/lib/spotify";
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
    
    // Get query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const limitParam = url.searchParams.get("limit");
    
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }
    
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Set access token from session
    spotifyApi.setAccessToken(session.accessToken);
    
    // Search for tracks
    const tracks = await searchTracks(query, limit);
    
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error in search route:", error);
    return NextResponse.json(
      { error: "Failed to search tracks" },
      { status: 500 }
    );
  }
} 