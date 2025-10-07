import { Room, Player, GameActivity, GameState } from "@shared/schema";
import { storage } from "../storage";
import { MathValidator, ValidationResult } from "./mathValidator";
import { SolutionFinder } from "./solutionFinder";

export class GameEngine {
  private static timers: Map<string, NodeJS.Timeout> = new Map();
  private static gameStates: Map<string, GameState> = new Map();

  static async createRoom(maxPlayers: number = 4): Promise<Room> {
    const code = storage.generateRoomCode();
    const room = await storage.createRoom({
      code,
      maxPlayers,
      gameState: "waiting",
      currentNumbers: SolutionFinder.generateNumbers(),
      timer: 60,
      currentRound: 0,
      maxRounds: 10,
    });

    // Initialize game state
    this.gameStates.set(room.id, {
      room,
      players: [],
      activities: [],
      timeRemaining: 60,
      isTimerRunning: false,
    });

    return room;
  }

  static async joinRoom(roomCode: string, playerName: string, avatar: string, color: string): Promise<{ room: Room; player: Player } | null> {
    const room = await storage.getRoomByCode(roomCode);
    if (!room) return null;

    const existingPlayers = await storage.getPlayersByRoomId(room.id);
    if (existingPlayers.length >= room.maxPlayers) {
      throw new Error("Room is full");
    }

    const player = await storage.createPlayer({
      roomId: room.id,
      name: playerName,
      avatar,
      color,
      score: 0,
      isActive: false,
      isReady: false,
    });

    // Update game state
    const gameState = this.gameStates.get(room.id);
    if (gameState) {
      gameState.players = [...existingPlayers, player];
    }

    return { room, player };
  }

  static async startGame(roomCode: string): Promise<GameState | null> {
    const room = await storage.getRoomByCode(roomCode);
    if (!room) return null;

    const players = await storage.getPlayersByRoomId(room.id);
    if (players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    // Update room state
    const updatedRoom = await storage.updateRoom(room.id, {
      gameState: "playing",
      currentRound: 1,
      currentNumbers: SolutionFinder.generateNumbers(),
    });

    if (!updatedRoom) return null;

    // Free-for-all mode: no active player; all can submit simultaneously

    // Start timer
    this.startRoundTimer(room.id, 60);

    const gameState: GameState = {
      room: updatedRoom,
      players: await storage.getPlayersByRoomId(room.id),
      activities: await storage.getActivitiesByRoomId(room.id),
      timeRemaining: 60,
      isTimerRunning: true,
    };

    this.gameStates.set(room.id, gameState);
    return gameState;
  }

  static async submitExpression(roomCode: string, playerId: string, expression: string): Promise<{ validation: ValidationResult; gameState: GameState } | null> {
    const room = await storage.getRoomByCode(roomCode);
    if (!room || !room.currentNumbers) return null;

    const player = await storage.updatePlayer(playerId, {});
    if (!player) return null;

    // Validate expression
    const validation = MathValidator.validateExpression(expression, room.currentNumbers);
    
    let points = 0;
    let activityType = "attempted";

    if (validation.isValid) {
      points = 50; // Base points for correct solution
      activityType = "solved";
      
      // Add bonus points based on time remaining
      const gameState = this.gameStates.get(room.id);
      if (gameState && gameState.timeRemaining > 30) {
        points += 25; // Bonus for solving quickly
      }

      // Update player score
      await storage.updatePlayer(playerId, { 
        score: player.score + points 
      });

      // Move to next round
      await this.nextRound(room.id);
    }

    // Create activity
    await storage.createActivity({
      roomId: room.id,
      playerId: player.id,
      playerName: player.name,
      type: activityType,
      expression,
      result: validation.result,
      points,
    });

    const updatedGameState = await this.getGameState(room.id);
    return updatedGameState ? { validation, gameState: updatedGameState } : null;
  }

  static async showSolution(roomCode: string): Promise<{ solution: string; gameState: GameState } | null> {
    const room = await storage.getRoomByCode(roomCode);
    if (!room || !room.currentNumbers) return null;

    const solution = SolutionFinder.findSolution(room.currentNumbers);
    if (!solution) return null;

    // Create activity for solution reveal
    await storage.createActivity({
      roomId: room.id,
      playerId: null,
      playerName: "System",
      type: "solution_revealed",
      expression: solution.expression,
      result: 24,
      points: 0,
    });

    // Move to next round
    await this.nextRound(room.id);

    const gameState = await this.getGameState(room.id);
    return gameState ? { solution: solution.expression, gameState } : null;
  }

  private static async nextRound(roomId: string): Promise<void> {
    const room = await storage.updateRoom(roomId, {});
    if (!room) return;

    // Stop current timer
    const timer = this.timers.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(roomId);
    }

    if (room.currentRound >= room.maxRounds) {
      // Game finished
      await storage.updateRoom(roomId, { gameState: "finished" });
    } else {
      // Next round
      const newNumbers = SolutionFinder.generateNumbers();
      await storage.updateRoom(roomId, {
        currentRound: room.currentRound + 1,
        currentNumbers: newNumbers,
      });

      // Free-for-all mode: do not rotate an active player; all players remain eligible to submit

      // Start new timer
      this.startRoundTimer(roomId, 60);
    }
  }

  private static startRoundTimer(roomId: string, seconds: number): void {
    const gameState = this.gameStates.get(roomId);
    if (!gameState) return;

    gameState.timeRemaining = seconds;
    gameState.isTimerRunning = true;

    const timer = setInterval(async () => {
      const currentGameState = this.gameStates.get(roomId);
      if (!currentGameState) {
        clearInterval(timer);
        return;
      }

      currentGameState.timeRemaining--;

      if (currentGameState.timeRemaining <= 0) {
        clearInterval(timer);
        this.timers.delete(roomId);
        currentGameState.isTimerRunning = false;

        // Time's up - move to next round
        await this.nextRound(roomId);
      }
    }, 1000);

    this.timers.set(roomId, timer);
  }

  static async getGameState(roomId: string): Promise<GameState | null> {
    const room = await storage.updateRoom(roomId, {});
    if (!room) return null;

    const players = await storage.getPlayersByRoomId(roomId);
    const activities = await storage.getActivitiesByRoomId(roomId);

    const gameState = this.gameStates.get(roomId);
    const timeRemaining = gameState?.timeRemaining || 60;
    const isTimerRunning = gameState?.isTimerRunning || false;

    const updatedGameState: GameState = {
      room,
      players,
      activities,
      timeRemaining,
      isTimerRunning,
    };

    this.gameStates.set(roomId, updatedGameState);
    return updatedGameState;
  }
}
