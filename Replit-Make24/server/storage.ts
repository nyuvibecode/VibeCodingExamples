import { type Room, type Player, type GameActivity, type InsertRoom, type InsertPlayer, type InsertActivity } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined>;
  
  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByRoomId(roomId: string): Promise<Player[]>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  removePlayer(id: string): Promise<void>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<GameActivity>;
  getActivitiesByRoomId(roomId: string): Promise<GameActivity[]>;
  
  // Utility
  generateRoomCode(): string;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private players: Map<string, Player>;
  private activities: Map<string, GameActivity>;

  constructor() {
    this.rooms = new Map();
    this.players = new Map();
    this.activities = new Map();
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = {
      id,
      code: insertRoom.code || this.generateRoomCode(),
      maxPlayers: insertRoom.maxPlayers ?? 4,
      currentRound: insertRoom.currentRound ?? 0,
      maxRounds: insertRoom.maxRounds ?? 10,
      gameState: insertRoom.gameState ?? "waiting",
      currentNumbers: insertRoom.currentNumbers ? [...insertRoom.currentNumbers] : null,
      timer: insertRoom.timer ?? 60,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.code === code);
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      id,
      roomId: insertPlayer.roomId,
      name: insertPlayer.name,
      score: insertPlayer.score ?? 0,
      isActive: insertPlayer.isActive ?? false,
      isReady: insertPlayer.isReady ?? false,
      avatar: insertPlayer.avatar ?? "A",
      color: insertPlayer.color ?? "#3B82F6",
      joinedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayersByRoomId(roomId: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.roomId === roomId);
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async removePlayer(id: string): Promise<void> {
    this.players.delete(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<GameActivity> {
    const id = randomUUID();
    const activity: GameActivity = {
      id,
      roomId: insertActivity.roomId,
      playerId: insertActivity.playerId ?? null,
      playerName: insertActivity.playerName,
      type: insertActivity.type,
      expression: insertActivity.expression ?? null,
      result: insertActivity.result ?? null,
      points: insertActivity.points ?? null,
      timestamp: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivitiesByRoomId(roomId: string): Promise<GameActivity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.roomId === roomId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }
}

export const storage = new MemStorage();
