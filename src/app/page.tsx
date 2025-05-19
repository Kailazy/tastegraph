"use client";

import { useState, useEffect } from "react";
import Canvas from "@/components/Canvas";
import AudioPlayer from "@/components/AudioPlayer";
import { Node } from "@/types";
import Link from "next/link";

// Global style for retro look - simplified
const retroStyle = {
  fontFamily: "'Times New Roman', serif",
  backgroundColor: "#FFFFFF",
  color: "#000000",
};

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  // Load saved nodes and background from localStorage if available
  useEffect(() => {
    const savedNodes = localStorage.getItem("tastegraph-nodes");
    const savedBackground = localStorage.getItem("tastegraph-background");

    if (savedNodes) {
      try {
        setNodes(JSON.parse(savedNodes));
      } catch (e) {
        console.error("Failed to parse saved nodes");
      }
    }

    if (savedBackground) {
      setBackgroundColor(savedBackground);
    }
  }, []);

  // Save nodes and background to localStorage when they change
  useEffect(() => {
    localStorage.setItem("tastegraph-nodes", JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem("tastegraph-background", backgroundColor);
  }, [backgroundColor]);

  const handleAddNode = (node: Node) => {
    setNodes([...nodes, node]);
  };

  const handleAddTextNode = (text: string, x: number, y: number) => {
    const newTextNode: Node = {
      id: `text-${Date.now()}`,
      x,
      y,
      text,
      color: "transparent",
      size: 0,
    };

    setNodes([...nodes, newTextNode]);
  };

  return (
    <div className="w-screen h-screen overflow-hidden" style={retroStyle}>
      <div className="fixed top-0 left-0 w-full bg-white flex justify-between items-center border-b border-black z-10 px-4 py-1">
        <h1
          className="text-lg"
          style={{ fontFamily: "'Times New Roman', serif" }}
        >
          TasteGraph
        </h1>
        <Link
          href="/spotify"
          className="px-2 py-1 border border-black hover:bg-gray-100"
          style={{ fontFamily: "'Times New Roman', serif" }}
        >
          Spotify Song Graph
        </Link>
      </div>

      <div className="w-full h-full pt-8 border-0">
        {/* Canvas component that fills the entire screen */}
        <Canvas
          nodes={nodes}
          onAddNode={handleAddNode}
          onAddTextNode={handleAddTextNode}
          backgroundColor={backgroundColor}
        />

        {/* Audio player for background music */}
        <AudioPlayer autoPlay={true} />
      </div>
    </div>
  );
}
