import { User } from "@/types";

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  image?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  bio?: string;
  name?: string;
  image?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface UserCreateEntity {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash?: string;
  image?: string;
  bio?: string;
}

export interface UserUpdateEntity {
  name?: string;
  bio?: string;
  image?: string;
  updatedAt?: Date;
}

/**
 * Data Access Contract for Users (Repository Pattern)
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailOrUsername(email: string, username: string): Promise<User | null>;
  findPasswordHashByEmail(email: string): Promise<{ user: User; passwordHash?: string | null } | null>;
  create(entity: UserCreateEntity): Promise<User>;
  update(userId: string, data: UserUpdateEntity): Promise<User>;
}

/**
 * Single-responsibility Password Hasher abstraction
 */
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

/**
 * Single-responsibility Session Token abstraction
 */
export interface ISessionManager {
  createToken(user: User): string;
  parseToken(token: string): { userId: string; exp: number } | null;
  getCookie(): Promise<string | undefined>;
  setCookie(token: string): Promise<void>;
  clearCookie(): Promise<void>;
}

/**
 * High-level business contract for Authentication
 */
export interface IAuthService {
  register(dto: RegisterDTO): Promise<User>;
  login(dto: LoginDTO): Promise<AuthSession>;
  verifySession(token: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  updateProfile(userId: string, data: UpdateProfileDTO): Promise<User>;
}
