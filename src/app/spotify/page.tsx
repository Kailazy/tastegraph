"use client";

import { useState, useEffect } from "react";
import SongGraph from "@/components/SongGraph";
import { useSession, signIn } from "next-auth/react";

// Types for Spotify tracks and features
interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  preview_url: string | null;
  popularity: number;
}

interface SpotifyFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
}

interface SongNode {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumImageUrl?: string;
  x: number;
  y: number;
  color: string;
  size: number;
  features?: SpotifyFeatures;
  text?: string;
}

interface SongConnection {
  id: string;
  sourceId: string;
  targetId: string;
  similarityScore: number;
  featureType: string;
}

export default function SpotifyGraph() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [nodes, setNodes] = useState<SongNode[]>([]);
  const [connections, setConnections] = useState<SongConnection[]>([]);
  const [selectedFeature, setSelectedFeature] = useState("overall");

  // Search for tracks
  const handleSearch = async () => {
    if (!searchQuery || !session?.accessToken) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.tracks) {
        setSearchResults(data.tracks);
      }
    } catch (error) {
      console.error("Error searching tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a track to the graph
  const addTrackToGraph = async (track: SpotifyTrack) => {
    try {
      // Get audio features for the track
      const response = await fetch(`/api/spotify/features?trackId=${track.id}`);
      const data = await response.json();

      if (!data.features) return;

      // Calculate position (for simplicity, random position)
      const x =
        Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
      const y =
        Math.random() * (window.innerHeight * 0.7) + window.innerHeight * 0.15;

      // Create new node
      const newNode: SongNode = {
        id: track.id,
        trackId: track.id,
        trackName: track.name,
        artistName: track.artists.map((a: SpotifyArtist) => a.name).join(", "),
        albumImageUrl: track.album.images[0]?.url,
        x,
        y,
        color: "#FFFFFF",
        size: 60,
        features: data.features,
      };

      // Add to nodes array
      setNodes((prev: SongNode[]) => {
        // Skip if this track is already in the graph
        if (prev.some((n) => n.trackId === track.id)) return prev;

        const newNodes = [...prev, newNode];

        // If we have multiple nodes, create connections
        if (newNodes.length > 1) {
          createConnections(newNodes, newNode);
        }

        return newNodes;
      });
    } catch (error) {
      console.error("Error adding track to graph:", error);
    }
  };

  // Create connections between nodes
  const createConnections = (allNodes: SongNode[], newNode: SongNode) => {
    const newConnections: SongConnection[] = [];

    // For each existing node, create a connection to the new node
    allNodes.forEach((existingNode) => {
      if (existingNode.id === newNode.id) return;

      // Skip if both nodes don't have features
      if (!existingNode.features || !newNode.features) return;

      // Calculate similarity for each feature
      const danceabilityDiff = Math.abs(
        existingNode.features.danceability - newNode.features.danceability
      );
      const energyDiff = Math.abs(
        existingNode.features.energy - newNode.features.energy
      );
      const valenceDiff = Math.abs(
        existingNode.features.valence - newNode.features.valence
      );
      const tempoDiff = Math.abs(
        existingNode.features.tempo / 250 - newNode.features.tempo / 250
      );
      const acousticnessDiff = Math.abs(
        existingNode.features.acousticness - newNode.features.acousticness
      );

      // Overall similarity (inverse of total difference)
      const totalDiff =
        danceabilityDiff +
        energyDiff +
        valenceDiff +
        tempoDiff +
        acousticnessDiff;
      const similarityScore = 1 - totalDiff / 5;

      // Create a connection for each feature type
      const features = [
        { type: "danceability", diff: danceabilityDiff, threshold: 0.2 },
        { type: "energy", diff: energyDiff, threshold: 0.2 },
        { type: "valence", diff: valenceDiff, threshold: 0.2 },
        { type: "tempo", diff: tempoDiff, threshold: 0.15 },
        { type: "acousticness", diff: acousticnessDiff, threshold: 0.2 },
      ];

      // Add overall connection
      newConnections.push({
        id: `${existingNode.id}-${newNode.id}-overall`,
        sourceId: existingNode.id,
        targetId: newNode.id,
        similarityScore,
        featureType: "overall",
      });

      // Add feature-specific connections if they're similar enough
      features.forEach(({ type, diff, threshold }) => {
        if (diff <= threshold) {
          newConnections.push({
            id: `${existingNode.id}-${newNode.id}-${type}`,
            sourceId: existingNode.id,
            targetId: newNode.id,
            similarityScore: 1 - diff,
            featureType: type,
          });
        }
      });
    });

    setConnections((prev: SongConnection[]) => [...prev, ...newConnections]);
  };

  // Simple login button if not authenticated
  if (status === "unauthenticated") {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ fontFamily: "'Times New Roman', serif" }}
      >
        <div className="text-center p-4 border border-black bg-white">
          <h1 className="text-xl mb-4">Spotify Song Graph</h1>
          <p className="mb-4">
            Sign in with your Spotify account to visualize song connections
          </p>
          <button
            onClick={() => signIn("spotify")}
            className="px-4 py-2 bg-black text-white border border-black"
          >
            Login with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top bar with search */}
      <div
        className="p-2 border-b border-black flex items-center gap-2"
        style={{ fontFamily: "'Times New Roman', serif" }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for songs..."
          className="border border-black px-2 py-1 w-64"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-2 py-1 bg-white border border-black"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>

        <div className="ml-4 flex items-center gap-2">
          <span>Connection type:</span>
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            className="border border-black px-1"
          >
            <option value="overall">All Connections</option>
            <option value="danceability">Danceability</option>
            <option value="energy">Energy</option>
            <option value="valence">Mood (Valence)</option>
            <option value="tempo">Tempo</option>
            <option value="acousticness">Acousticness</option>
          </select>
        </div>
      </div>

      {/* Main content area with graph and search results */}
      <div className="flex-1 flex">
        {/* Graph visualization */}
        <div className="flex-1 h-full">
          <SongGraph
            nodes={nodes}
            connections={connections.filter((c) =>
              selectedFeature === "overall"
                ? true
                : c.featureType === selectedFeature
            )}
            backgroundColor="#FFFFFF"
          />
        </div>

        {/* Search results sidebar */}
        {searchResults.length > 0 && (
          <div
            className="w-64 h-full overflow-y-auto border-l border-black p-2"
            style={{ fontFamily: "'Times New Roman', serif" }}
          >
            <h3 className="font-bold mb-2 text-center border-b border-black pb-1">
              Search Results
            </h3>
            <div className="space-y-2">
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  className="p-1 border border-black cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => addTrackToGraph(track)}
                >
                  {track.album.images[2] && (
                    <img
                      src={track.album.images[2].url}
                      alt={track.name}
                      className="w-10 h-10 object-cover"
                    />
                  )}
                  <div className="overflow-hidden">
                    <div className="font-bold truncate">{track.name}</div>
                    <div className="text-xs truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
