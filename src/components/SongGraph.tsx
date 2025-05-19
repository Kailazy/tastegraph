"use client";

import { useRef, useState, useEffect } from "react";
import { Node } from "@/types";

// Extended Node type to include Spotify track info
interface SongNode extends Node {
  trackId: string;
  trackName: string;
  artistName: string;
  albumImageUrl?: string;
  features?: SpotifyFeatures;
}

// Connection between two song nodes
interface SongConnection {
  id: string;
  sourceId: string;
  targetId: string;
  similarityScore: number;
  featureType: FeatureType;
}

// Spotify audio features
interface SpotifyFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
}

// Feature types for connections
type FeatureType =
  | "danceability"
  | "energy"
  | "valence"
  | "tempo"
  | "acousticness"
  | "overall";

interface SongGraphProps {
  nodes: SongNode[];
  connections: SongConnection[];
  onAddNode?: (node: SongNode) => void;
  onSelectNode?: (node: SongNode) => void;
  backgroundColor?: string;
}

export default function SongGraph({
  nodes = [],
  connections = [],
  onAddNode,
  onSelectNode,
  backgroundColor = "#FFFFFF",
}: SongGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SongNode | null>(null);

  // Function to get line style based on feature type
  const getLineStyle = (connection: SongConnection) => {
    const baseStyle = {
      position: "absolute" as const,
      height: "1px",
      transformOrigin: "0 0",
      zIndex: 0,
    };

    // Determine style based on feature type
    switch (connection.featureType) {
      case "danceability":
        return {
          ...baseStyle,
          backgroundColor: "#FF1493", // Hot pink
          height: "2px",
          borderTop: "1px dashed #FF1493",
        };
      case "energy":
        return {
          ...baseStyle,
          backgroundColor: "#FF4500", // Orange-red
          height: `${Math.max(1, connection.similarityScore * 4)}px`,
        };
      case "valence":
        // Color from blue (sad) to yellow (happy)
        const blueToYellow =
          connection.similarityScore > 0.5
            ? "#FFD700" // Gold for happy
            : "#1E90FF"; // Dodger blue for sad
        return {
          ...baseStyle,
          backgroundColor: blueToYellow,
          height: "1px",
        };
      case "tempo":
        return {
          ...baseStyle,
          backgroundColor: "#32CD32", // Lime green
          borderTop: "1px dashed #32CD32",
        };
      case "acousticness":
        return {
          ...baseStyle,
          backgroundColor: "#8A2BE2", // Blue violet
          height: "1px",
        };
      default:
        // Default/overall connection
        return {
          ...baseStyle,
          backgroundColor: "#000000",
          height: "1px",
          opacity: Math.max(0.1, connection.similarityScore),
        };
    }
  };

  // Calculate position and angle for connections
  const calculateConnection = (source: SongNode, target: SongNode) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      left: `${source.x}px`,
      top: `${source.y}px`,
      width: `${length}px`,
      transform: `rotate(${angle}deg)`,
    };
  };

  // Handle node click
  const handleNodeClick = (node: SongNode) => {
    setSelectedNode(node === selectedNode ? null : node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative"
      style={{ backgroundColor }}
    >
      {/* Render connections */}
      {connections.map((connection) => {
        const source = nodes.find((n) => n.id === connection.sourceId);
        const target = nodes.find((n) => n.id === connection.targetId);

        if (!source || !target) return null;

        const linePosition = calculateConnection(source, target);
        const lineStyle = getLineStyle(connection);

        return (
          <div
            key={connection.id}
            style={{
              ...lineStyle,
              ...linePosition,
            }}
          />
        );
      })}

      {/* Render nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute cursor-pointer"
          style={{
            left: `${node.x}px`,
            top: `${node.y}px`,
            transform: "translate(-50%, -50%)",
            zIndex: node === selectedNode ? 20 : 10,
          }}
          onClick={() => handleNodeClick(node)}
        >
          {/* Album Image */}
          <div
            className="rounded-full overflow-hidden border border-black"
            style={{
              width: `${node.size}px`,
              height: `${node.size}px`,
              backgroundColor: node.color,
            }}
          >
            {node.albumImageUrl && (
              <img
                src={node.albumImageUrl}
                alt={node.trackName}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Track name (only show when selected or hovered) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white border border-black px-1 text-xs"
            style={{
              display: node === selectedNode ? "block" : "none",
              width: "max-content",
              maxWidth: "120px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontFamily: "'Times New Roman', serif",
            }}
          >
            {node.trackName} - {node.artistName}
          </div>
        </div>
      ))}
    </div>
  );
}
