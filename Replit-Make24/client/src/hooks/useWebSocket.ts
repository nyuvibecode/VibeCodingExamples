import { useEffect, useRef, useState, useCallback } from "react";
import { WSMessage, GameState } from "@shared/schema";

interface WebSocketHook {
  isConnected: boolean;
  send: (message: WSMessage) => void;
  gameState: GameState | null;
  error: string | null;
  playerId: string | null;
}

export function useWebSocket(roomCode: string | null): WebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const messageQueue = useRef<WSMessage[]>([]);

  const send = useCallback((message: WSMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("Sending WebSocket message:", message.type);
      ws.current.send(JSON.stringify(message));
    } else {
      console.log("WebSocket not ready, queueing message:", message.type);
      messageQueue.current.push(message);
    }
  }, []);

  const sendQueuedMessages = useCallback(() => {
    while (messageQueue.current.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
      const message = messageQueue.current.shift()!;
      console.log("Sending queued message:", message.type);
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (!roomCode) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    // In Replit, use the same host and port as the current page
    const port = window.location.port ? `:${window.location.port}` : '';
    const wsUrl = `${protocol}//${host}${port}/api/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected to:", wsUrl);
      setIsConnected(true);
      setError(null);
      // Send any queued messages
      sendQueuedMessages();
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case "join_success":
            setPlayerId(message.data.player.id);
            setGameState(message.data.gameState);
            break;
            
          case "join_error":
            setError(message.data.error);
            break;
            
          case "game_state_update":
          case "game_started":
            setGameState(message.data);
            break;
            
          case "expression_result":
            setGameState(message.data.gameState);
            break;
            
          case "solution_revealed":
            setGameState(message.data.gameState);
            break;
            
          case "timer_update":
            setGameState(prev => prev ? {
              ...prev,
              timeRemaining: message.data.timeRemaining,
              isTimerRunning: message.data.isTimerRunning
            } : null);
            break;
            
          case "start_error":
            setError(message.data.error);
            break;
            
          case "error":
            setError(message.data.error);
            break;
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setIsConnected(false);
    };

    ws.current.onerror = (event) => {
      console.error("WebSocket error:", event);
      setError("WebSocket connection failed");
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      messageQueue.current = [];
      setIsConnected(false);
      setPlayerId(null);
      setGameState(null);
      setError(null);
    };
  }, [roomCode]);

  return {
    isConnected,
    send,
    gameState,
    error,
    playerId
  };
}
