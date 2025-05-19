# TasteGraph with Spotify API Integration

## Project Overview

We'll integrate Spotify's Web API to create an interactive graph where songs are represented as nodes, and connections between them represent similarity in audio features (danceability, energy, valence/happiness, tempo, etc).

## Core Components

### 1. Spotify API Authentication

- Set up OAuth flow for Spotify API access
- Create authentication endpoints for user login
- Store and manage access tokens

### 2. Song Search and Selection

- Implement a song search interface using Spotify's search endpoint
- Allow users to select songs to add to the graph
- Display album art and basic track information

### 3. Audio Features Analysis

- Fetch audio features using Spotify's audio-features endpoint
- Features to track:
  - Danceability (0-1)
  - Energy (0-1)
  - Valence (happiness, 0-1)
  - Acousticness (0-1)
  - Tempo (BPM)
  - Instrumentalness (0-1)

### 4. Graph Visualization

- Represent songs as nodes with album artwork
- Create different types of connections between songs:
  - Similar danceability: wavy lines
  - Similar energy: bold/thin lines
  - Similar valence: colored lines (blue for sad, yellow for happy)
  - Similar tempo: dashed lines
- Node size can represent popularity

### 5. Feature Comparison

- Show feature comparison when selecting two nodes
- Visualize which features are most similar
- Recommend other songs based on selected feature similarity

## Technical Implementation

1. **Backend**:

   - Next.js API routes for Spotify API communication
   - Secure token management

2. **Database**:

   - Store user sessions and saved graphs
   - Cache song data to minimize API calls

3. **Frontend**:

   - Use HTML Canvas or a library like D3.js for graph visualization
   - Implement drag-and-drop interface for song placement
   - Custom controls for feature weight adjustment

4. **Spotify Integration**:
   - Required endpoints:
     - `/search` - Finding songs
     - `/audio-features` - Getting song characteristics
     - `/recommendations` - Finding related songs

## User Flow

1. User logs in with Spotify
2. Searches for and selects a few songs
3. System automatically places songs as nodes
4. System analyzes audio features and creates connections
5. User can adjust which features are prioritized
6. User can add more songs or get recommendations based on current nodes
