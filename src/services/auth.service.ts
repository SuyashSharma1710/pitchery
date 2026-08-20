import { User } from "@/types";
import {
  IAuthService,
  RegisterDTO,
  LoginDTO,
  AuthSession,
  UpdateProfileDTO,
  IUserRepository,
  IPasswordHasher,
  ISessionManager,
} from "@/core/interfaces/auth.interface";

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly sessionManager: ISessionManager
  ) {}

  async register(dto: RegisterDTO): Promise<User> {
    const existing = await this.userRepository.findByEmailOrUsername(
      dto.email,
      dto.username
    );

    if (existing) {
      if (existing.email.toLowerCase() === dto.email.toLowerCase().trim()) {
        throw new Error("An account with this email already exists.");
      }
      throw new Error("This username is already taken.");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const userId = "user_" + Math.random().toString(36).substring(2, 9);
    const fallbackImage =
      dto.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${dto.username}`;

    return await this.userRepository.create({
      id: userId,
      name: dto.name.trim(),
      username: dto.username.toLowerCase().trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      image: fallbackImage,
      bio: dto.bio || "Founder on Pitchery",
    });
  }

  async login(dto: LoginDTO): Promise<AuthSession> {
    const emailClean = dto.email.toLowerCase().trim();
    const record = await this.userRepository.findPasswordHashByEmail(emailClean);

    if (!record) {
      throw new Error("Invalid email or password.");
    }

    const { user, passwordHash } = record;

    // If passwordHash exists, verify hash. If not set (e.g. seeded demo accounts), allow login
    if (passwordHash) {
      const isValid = await this.passwordHasher.verify(dto.password, passwordHash);
      if (!isValid) {
        throw new Error("Invalid email or password.");
      }
    }

    const token = this.sessionManager.createToken(user);
    return { user, token };
  }

  async verifySession(token: string): Promise<User | null> {
    const payload = this.sessionManager.parseToken(token);
    if (!payload) return null;

    return await this.userRepository.findById(payload.userId);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.sessionManager.getCookie();
      if (!token) return null;
      return await this.verifySession(token);
    } catch {
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<User> {
    return await this.userRepository.update(userId, data);
  }
}
