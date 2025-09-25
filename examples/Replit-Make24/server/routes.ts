import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { GameEngine } from "./services/gameEngine";
import { insertRoomSchema, insertPlayerSchema, type WSMessage, type PlayerJoinMessage, type ExpressionSubmitMessage, type SolutionRequestMessage, type GameStartMessage } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // REST API Routes
  app.post("/api/rooms", async (req, res) => {
    try {
      const { maxPlayers = 4 } = req.body;
      const room = await GameEngine.createRoom(maxPlayers);
      res.json({ success: true, room });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const room = await storage.getRoomByCode(req.params.code);
      if (!room) {
        return res.status(404).json({ success: false, error: "Room not found" });
      }
      
      const gameState = await GameEngine.getGameState(room.id);
      res.json({ success: true, gameState });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // WebSocket Server - use a different path to avoid Vite conflicts
  const wss = new WebSocketServer({ server: httpServer, path: '/api/ws' });
  
  const clients = new Map<WebSocket, { roomCode?: string; playerId?: string }>();

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    clients.set(ws, {});

    ws.on("message", async (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case "player_join": {
            const joinData = message as PlayerJoinMessage;
            const { roomCode, playerName, avatar, color } = joinData.data;
            
            const result = await GameEngine.joinRoom(roomCode, playerName, avatar, color);
            if (result) {
              const clientInfo = clients.get(ws);
              if (clientInfo) {
                clientInfo.roomCode = roomCode;
                clientInfo.playerId = result.player.id;
              }

              const gameState = await GameEngine.getGameState(result.room.id);
              
              // Broadcast to all clients in the room
              broadcastToRoom(roomCode, {
                type: "game_state_update",
                data: gameState
              });

              ws.send(JSON.stringify({
                type: "join_success",
                data: { player: result.player, gameState }
              }));
            } else {
              ws.send(JSON.stringify({
                type: "join_error",
                data: { error: "Room not found" }
              }));
            }
            break;
          }

          case "game_start": {
            const startData = message as GameStartMessage;
            const { roomCode } = startData.data;
            
            try {
              const gameState = await GameEngine.startGame(roomCode);
              if (gameState) {
                broadcastToRoom(roomCode, {
                  type: "game_started",
                  data: gameState
                });
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "start_error",
                data: { error: (error as Error).message }
              }));
            }
            break;
          }

          case "expression_submit": {
            const submitData = message as ExpressionSubmitMessage;
            const { roomCode, playerId, expression } = submitData.data;
            
            const result = await GameEngine.submitExpression(roomCode, playerId, expression);
            if (result) {
              broadcastToRoom(roomCode, {
                type: "expression_result",
                data: {
                  validation: result.validation,
                  gameState: result.gameState
                }
              });
            }
            break;
          }

          case "solution_request": {
            const solutionData = message as SolutionRequestMessage;
            const { roomCode } = solutionData.data;
            
            const result = await GameEngine.showSolution(roomCode);
            if (result) {
              broadcastToRoom(roomCode, {
                type: "solution_revealed",
                data: {
                  solution: result.solution,
                  gameState: result.gameState
                }
              });
            }
            break;
          }

          case "timer_sync": {
            const clientInfo = clients.get(ws);
            if (clientInfo?.roomCode) {
              const room = await storage.getRoomByCode(clientInfo.roomCode);
              if (room) {
                const gameState = await GameEngine.getGameState(room.id);
                if (gameState) {
                  ws.send(JSON.stringify({
                    type: "timer_update",
                    data: {
                      timeRemaining: gameState.timeRemaining,
                      isTimerRunning: gameState.isTimerRunning
                    }
                  }));
                }
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({
          type: "error",
          data: { error: "Invalid message format" }
        }));
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clients.delete(ws);
    });
  });

  function broadcastToRoom(roomCode: string, message: WSMessage) {
    clients.forEach((clientInfo, client) => {
      if (clientInfo.roomCode === roomCode && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Timer sync broadcast every second
  setInterval(() => {
    const roomStates = new Map<string, any>();
    
    clients.forEach(async (clientInfo) => {
      if (clientInfo.roomCode && !roomStates.has(clientInfo.roomCode)) {
        const room = await storage.getRoomByCode(clientInfo.roomCode);
        if (room) {
          const gameState = await GameEngine.getGameState(room.id);
          if (gameState && gameState.isTimerRunning) {
            roomStates.set(clientInfo.roomCode, gameState);
          }
        }
      }
    });

    roomStates.forEach((gameState, roomCode) => {
      broadcastToRoom(roomCode, {
        type: "timer_update",
        data: {
          timeRemaining: gameState.timeRemaining,
          isTimerRunning: gameState.isTimerRunning
        }
      });
    });
  }, 1000);

  return httpServer;
}
