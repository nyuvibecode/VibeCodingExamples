import { useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { apiRequest } from "@/lib/queryClient";

interface UseGameProps {
  onRoomCreated?: (roomCode: string) => void;
  onGameJoined?: (roomCode: string) => void;
}

export function useGame({ onRoomCreated, onGameJoined }: UseGameProps = {}) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { isConnected, send, gameState, error: wsError, playerId } = useWebSocket(roomCode);

  const createRoom = useCallback(async (maxPlayers: number = 4) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/rooms", { maxPlayers });
      const data = await response.json();
      
      if (data.success) {
        const newRoomCode = data.room.code;
        setRoomCode(newRoomCode);
        onRoomCreated?.(newRoomCode);
        return newRoomCode;
      } else {
        throw new Error(data.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onRoomCreated]);

  const joinRoom = useCallback(async (code: string, name: string, avatar: string = "A", color: string = "#3B82F6") => {
    try {
      setIsLoading(true);
      setPlayerName(name);
      setRoomCode(code);
      
      // Wait a bit for WebSocket connection to establish
      setTimeout(() => {
        send({
          type: "player_join",
          data: {
            roomCode: code,
            playerName: name,
            avatar,
            color
          }
        });
      }, 200);
      
      onGameJoined?.(code);
    } catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [send, onGameJoined]);

  const startGame = useCallback(() => {
    if (roomCode) {
      send({
        type: "game_start",
        data: { roomCode }
      });
    }
  }, [roomCode, send]);

  const submitExpression = useCallback((expression: string) => {
    if (roomCode && playerId) {
      send({
        type: "expression_submit",
        data: {
          roomCode,
          playerId,
          expression
        }
      });
    }
  }, [roomCode, playerId, send]);

  const requestSolution = useCallback(() => {
    if (roomCode && playerId) {
      send({
        type: "solution_request",
        data: {
          roomCode,
          playerId
        }
      });
    }
  }, [roomCode, playerId, send]);

  const copyRoomLink = useCallback(() => {
    if (roomCode) {
      const link = `${window.location.origin}/room/${roomCode}`;
      navigator.clipboard.writeText(link);
    }
  }, [roomCode]);

  return {
    // State
    roomCode,
    playerName,
    isLoading,
    isConnected,
    gameState,
    playerId,
    error: wsError,
    
    // Actions
    createRoom,
    joinRoom,
    startGame,
    submitExpression,
    requestSolution,
    copyRoomLink,
    
    // Setters
    setPlayerName
  };
}
