import { db } from "@/db";
import * as schema from "@/db/schema";
import { User } from "@/types";
import {
  IUserRepository,
  UserCreateEntity,
  UserUpdateEntity,
} from "@/core/interfaces/auth.interface";
import { eq, or } from "drizzle-orm";

export class DrizzleUserRepository implements IUserRepository {
  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.database
      .select()
      .from(schema.users)
      .where(or(eq(schema.users.id, id), eq(schema.users.username, id)))
      .limit(1);

    return rows[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const rows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username.toLowerCase().trim()))
      .limit(1);

    return rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()))
      .limit(1);

    return rows[0] || null;
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
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
  }

  async findPasswordHashByEmail(email: string): Promise<{ user: User; passwordHash?: string | null } | null> {
    const rows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()))
      .limit(1);

    if (rows.length === 0) return null;
    const { passwordHash, ...user } = rows[0];
    return { user, passwordHash };
  }

  async create(entity: UserCreateEntity): Promise<User> {
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
  }

  async update(userId: string, data: UserUpdateEntity): Promise<User> {
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
  }
}
