import { User } from "@/types";
import {
  IUserRepository,
  UserCreateEntity,
  UserUpdateEntity,
} from "@/core/interfaces/auth.interface";
import { SAMPLE_USERS } from "@/db/sample-data";

export class InMemoryUserRepository implements IUserRepository {
  private users: (User & { passwordHash?: string | null })[];

  constructor(initialUsers: User[] = SAMPLE_USERS) {
    this.users = [...initialUsers];
  }

  async findById(id: string): Promise<User | null> {
    const found = this.users.find((u) => u.id === id || u.username === id);
    return found ? { ...found } : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const target = username.toLowerCase().trim();
    const found = this.users.find((u) => u.username.toLowerCase() === target);
    return found ? { ...found } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase().trim();
    const found = this.users.find((u) => u.email.toLowerCase() === target);
    return found ? { ...found } : null;
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const eTarget = email.toLowerCase().trim();
    const uTarget = username.toLowerCase().trim();
    const found = this.users.find(
      (u) => u.email.toLowerCase() === eTarget || u.username.toLowerCase() === uTarget
    );
    return found ? { ...found } : null;
  }

  async findPasswordHashByEmail(email: string): Promise<{ user: User; passwordHash?: string | null } | null> {
    const target = email.toLowerCase().trim();
    const found = this.users.find((u) => u.email.toLowerCase() === target);
    if (!found) return null;
    return { user: { ...found }, passwordHash: found.passwordHash };
  }

  async create(entity: UserCreateEntity): Promise<User> {
    const newUser: User & { passwordHash?: string | null } = {
      id: entity.id,
      name: entity.name.trim(),
      username: entity.username.toLowerCase().trim(),
      email: entity.email.toLowerCase().trim(),
      passwordHash: entity.passwordHash,
      image: entity.image,
      bio: entity.bio || "Founder on Pitchery",
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    return { ...newUser };
  }

  async update(userId: string, data: UserUpdateEntity): Promise<User> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found.");

    if (data.bio !== undefined) user.bio = data.bio.trim();
    if (data.name !== undefined) user.name = data.name.trim();
    if (data.image !== undefined) user.image = data.image.trim();
    user.updatedAt = new Date().toISOString();

    return { ...user };
  }
}
