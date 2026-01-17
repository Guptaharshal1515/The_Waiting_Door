import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  durationSeconds: integer("duration_seconds").notNull(),
  completed: boolean("completed").default(false),
  waitedForDoor: boolean("waited_for_door").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({ 
  id: true, 
  createdAt: true 
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
