"use client";

import { useRef, useState } from "react";
import { Node } from "@/types";
import RetroMenu from "./RetroMenu";

interface CanvasProps {
  nodes: Node[];
  onAddNode: (node: Node) => void;
  onAddTextNode: (text: string, x: number, y: number) => void;
  backgroundColor: string;
}

export default function Canvas({
  nodes,
  onAddNode,
  onAddTextNode,
  backgroundColor,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    // Get the position relative to the canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Open the menu at click position
    setMenuPosition({ x, y });
  };

  const handleCloseMenu = () => {
    setMenuPosition(null);
  };

  const handleAddNode = () => {
    if (!menuPosition) return;

    // Create a new node
    const newNode = {
      id: `node-${Date.now()}`,
      x: menuPosition.x,
      y: menuPosition.y,
      color: getRandomColor(),
      size: 20, // Fixed size for consistency
      text: "",
    };

    onAddNode(newNode);
    setMenuPosition(null);
  };

  const handleAddText = (text: string) => {
    if (!menuPosition) return;
    onAddTextNode(text, menuPosition.x, menuPosition.y);
    setMenuPosition(null);
  };

  // Basic color selection
  const getRandomColor = () => {
    const colors = [
      "#000000", // black
      "#0000FF", // blue
      "#FF0000", // red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative cursor-pointer"
      style={{
        backgroundColor,
        cursor: menuPosition ? "default" : "pointer",
      }}
      onClick={handleCanvasClick}
    >
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute"
          style={{
            left: `${node.x}px`,
            top: `${node.y}px`,
            width: node.text ? "auto" : `${node.size}px`,
            height: node.text ? "auto" : `${node.size}px`,
            backgroundColor: node.text ? "transparent" : node.color,
            border: node.text ? "none" : "1px solid black",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Times New Roman', serif",
            padding: node.text ? "2px" : 0,
            color: "#000000",
            fontSize: node.text ? "12px" : "inherit",
            maxWidth: "150px",
            textAlign: "center",
          }}
        >
          {node.text}
        </div>
      ))}

      {menuPosition && (
        <RetroMenu
          position={menuPosition}
          onClose={handleCloseMenu}
          onAddNode={handleAddNode}
          onAddText={handleAddText}
        />
      )}
    </div>
  );
}
