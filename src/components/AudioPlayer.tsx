"use client";

import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  autoPlay?: boolean;
}

export default function AudioPlayer({ autoPlay = true }: AudioPlayerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Create AudioContext on user interaction (needed for some browsers)
    const initAudio = () => {
      if (audioContextRef.current) return;

      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // Create a gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);

      if (autoPlay) {
        playAmbientSound();
      }

      // Remove event listeners after initialization
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
      document.removeEventListener("touchstart", initAudio);
    };

    // Add event listeners to initialize audio on user interaction
    document.addEventListener("click", initAudio);
    document.addEventListener("keydown", initAudio);
    document.addEventListener("touchstart", initAudio);

    // Try to initialize immediately (works in some browsers)
    initAudio();

    return () => {
      // Clean up event listeners
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
      document.removeEventListener("touchstart", initAudio);

      // Stop and close audio context
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const playAmbientSound = async () => {
    if (!audioContextRef.current) return;

    try {
      // Fetch the audio file - using the one available in the audio folder
      const response = await fetch("/audio/courseover.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        arrayBuffer
      );

      // Stop previous sound if any
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }

      // Create and configure source node
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBuffer;
      sourceNodeRef.current.loop = true;

      // Connect to gain node and play
      sourceNodeRef.current.connect(gainNodeRef.current!);
      sourceNodeRef.current.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      playAmbientSound();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  // More minimal player styling
  const styles = {
    button: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12px",
      padding: "1px 3px",
      backgroundColor: "#CCCCCC",
      border: "1px outset #DDDDDD",
      cursor: "pointer",
    },
    playerContainer: {
      position: "fixed" as const,
      bottom: "2px",
      right: "2px",
      backgroundColor: "#EFEFEF",
      border: "1px outset #DDDDDD",
      padding: "2px",
      display: "flex",
      alignItems: "center",
      gap: "2px",
      zIndex: 100,
    },
  };

  return (
    <div>
      <button
        onClick={() => setShowControls(!showControls)}
        style={{
          ...styles.button,
          position: "fixed",
          bottom: "2px",
          right: "2px",
          zIndex: 101,
          display: showControls ? "none" : "block",
        }}
      >
        ♫
      </button>

      {showControls && (
        <div style={styles.playerContainer}>
          <button onClick={togglePlay} style={styles.button}>
            {isPlaying ? "◼" : "▶"}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: "40px", height: "8px" }}
          />

          <button onClick={() => setShowControls(false)} style={styles.button}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
