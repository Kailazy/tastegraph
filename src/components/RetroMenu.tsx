"use client";

import { useState } from "react";

interface RetroMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onAddNode: () => void;
  onAddText: (text: string) => void;
}

export default function RetroMenu({
  position,
  onClose,
  onAddNode,
  onAddText,
}: RetroMenuProps) {
  const [text, setText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const handleAddText = () => {
    if (text.trim()) {
      onAddText(text);
    } else {
      onClose();
    }
  };

  // Extremely minimal styling
  const styles = {
    menu: {
      position: "absolute" as const,
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: "translate(-50%, -50%)",
      backgroundColor: "#FFFFFF",
      border: "1px solid #000000",
      padding: "2px",
      fontFamily: "'Times New Roman', serif",
      fontSize: "12px",
      zIndex: 100,
    },
    button: {
      backgroundColor: "#EFEFEF",
      border: "1px solid #000000",
      margin: "1px",
      padding: "1px 4px",
      fontFamily: "'Times New Roman', serif",
      fontSize: "12px",
      cursor: "pointer",
    },
    textInput: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12px",
      margin: "2px 0",
      border: "1px solid #000000",
      width: "100%",
      padding: "2px",
    },
  };

  return (
    <div style={styles.menu} onClick={(e) => e.stopPropagation()}>
      {!showTextInput ? (
        <div style={{ padding: "2px" }}>
          <button style={styles.button} onClick={onAddNode}>
            Add Node
          </button>
          <button style={styles.button} onClick={() => setShowTextInput(true)}>
            Add Text
          </button>
          <button style={styles.button} onClick={onClose}>
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ padding: "2px", width: "150px" }}>
          <textarea
            style={styles.textInput}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Type here..."
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              style={styles.button}
              onClick={() => setShowTextInput(false)}
            >
              Back
            </button>
            <button style={styles.button} onClick={handleAddText}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
