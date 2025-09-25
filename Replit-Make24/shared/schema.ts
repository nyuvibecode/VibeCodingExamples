import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  maxPlayers: integer("max_players").notNull().default(4),
  currentRound: integer("current_round").notNull().default(0),
  maxRounds: integer("max_rounds").notNull().default(10),
  gameState: text("game_state").notNull().default("waiting"), // waiting, playing, finished
  currentNumbers: jsonb("current_numbers").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  timer: integer("timer").default(60),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  name: text("name").notNull(),
  score: integer("score").notNull().default(0),
  isActive: boolean("is_active").notNull().default(false),
  isReady: boolean("is_ready").notNull().default(false),
  avatar: text("avatar").notNull().default("A"),
  color: text("color").notNull().default("#3B82F6"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const gameActivities = pgTable("game_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  playerId: varchar("player_id"),
  playerName: text("player_name").notNull(),
  type: text("type").notNull(), // solved, attempted, hint, skip, solution_revealed
  expression: text("expression"),
  result: integer("result"),
  points: integer("points").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  joinedAt: true,
});

export const insertActivitySchema = createInsertSchema(gameActivities).omit({
  id: true,
  timestamp: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;
export type GameActivity = typeof gameActivities.$inferSelect;

// WebSocket message types
export interface WSMessage {
  type: string;
  data?: any;
}

export interface GameState {
  room: Room;
  players: Player[];
  activities: GameActivity[];
  timeRemaining: number;
  isTimerRunning: boolean;
}

export interface PlayerJoinMessage extends WSMessage {
  type: "player_join";
  data: {
    roomCode: string;
    playerName: string;
    avatar: string;
    color: string;
  };
}

export interface ExpressionSubmitMessage extends WSMessage {
  type: "expression_submit";
  data: {
    roomCode: string;
    playerId: string;
    expression: string;
  };
}

export interface SolutionRequestMessage extends WSMessage {
  type: "solution_request";
  data: {
    roomCode: string;
    playerId: string;
  };
}

export interface GameStartMessage extends WSMessage {
  type: "game_start";
  data: {
    roomCode: string;
  };
}
