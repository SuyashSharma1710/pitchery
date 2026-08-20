import { db } from "@/db";
import * as schema from "@/db/schema";
import { User } from "@/types";
import {
  IUserRepository,
  UserCreateEntity,
  UserUpdateEntity,
} from "@/core/interfaces/auth.interface";
import { InMemoryUserRepository } from "@/repositories/in-memory/user.in-memory.repository";
import { eq, or } from "drizzle-orm";

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly inMemory: IUserRepository = new InMemoryUserRepository()) {}

  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.users)
        .where(or(eq(schema.users.id, id), eq(schema.users.username, id)))
        .limit(1);

      return rows[0] || null;
    } catch (err) {
      console.warn("⚠️ Neon DB findById error (falling back to in-memory):", err);
      return this.inMemory.findById(id);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, username.toLowerCase().trim()))
        .limit(1);

      return rows[0] || null;
    } catch (err) {
      console.warn("⚠️ Neon DB findByUsername error (falling back to in-memory):", err);
      return this.inMemory.findByUsername(username);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email.toLowerCase().trim()))
        .limit(1);

      return rows[0] || null;
    } catch (err) {
      console.warn("⚠️ Neon DB findByEmail error (falling back to in-memory):", err);
      return this.inMemory.findByEmail(email);
    }
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.users)
        .where(
          or(
            eq(schema.users.email, email.toLowerCase().trim()),
            eq(schema.users.username, username.toLowerCase().trim())
          )
        )
        .limit(1);

      return rows[0] || null;
    } catch (err) {
      console.warn("⚠️ Neon DB findByEmailOrUsername error (falling back to in-memory):", err);
      return this.inMemory.findByEmailOrUsername(email, username);
    }
  }

  async findPasswordHashByEmail(email: string): Promise<{ user: User; passwordHash?: string | null } | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email.toLowerCase().trim()))
        .limit(1);

      if (rows.length === 0) return null;
      const { passwordHash, ...user } = rows[0];
      return { user, passwordHash };
    } catch (err) {
      console.warn("⚠️ Neon DB findPasswordHashByEmail error (falling back to in-memory):", err);
      return this.inMemory.findPasswordHashByEmail(email);
    }
  }

  async create(entity: UserCreateEntity): Promise<User> {
    try {
      const [newUser] = await this.database
        .insert(schema.users)
        .values({
          id: entity.id,
          name: entity.name.trim(),
          username: entity.username.toLowerCase().trim(),
          email: entity.email.toLowerCase().trim(),
          passwordHash: entity.passwordHash || null,
          image: entity.image,
          bio: entity.bio || "Founder on Pitchery",
        })
        .returning();

      return newUser;
    } catch (err) {
      console.warn("⚠️ Neon DB create user error (falling back to in-memory):", err);
      return this.inMemory.create(entity);
    }
  }

  async update(userId: string, data: UserUpdateEntity): Promise<User> {
    try {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (data.bio !== undefined) updates.bio = data.bio.trim();
      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.image !== undefined) updates.image = data.image.trim();

      const [updated] = await this.database
        .update(schema.users)
        .set(updates)
        .where(eq(schema.users.id, userId))
        .returning();

      return updated;
    } catch (err) {
      console.warn("⚠️ Neon DB update user error (falling back to in-memory):", err);
      return this.inMemory.update(userId, data);
    }
  }
}
