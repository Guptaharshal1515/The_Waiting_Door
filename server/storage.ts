import { gameSessions, type GameSession, type InsertGameSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createGameSession(session: InsertGameSession): Promise<GameSession>;
}

export class DatabaseStorage implements IStorage {
  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const [session] = await db
      .insert(gameSessions)
      .values(insertSession)
      .returning();
    return session;
  }
}

export const storage = new DatabaseStorage();
