import { db } from "@/db";
import { IUserRepository, IAuthService } from "@/core/interfaces/auth.interface";
import { IStartupRepository, IStartupService } from "@/core/interfaces/startup.interface";
import { ICommentRepository, ICommentService } from "@/core/interfaces/comment.interface";
import { IMessageRepository, IMessageService } from "@/core/interfaces/message.interface";

// Repositories
import { DrizzleUserRepository } from "@/repositories/drizzle/user.repository";
import { InMemoryUserRepository } from "@/repositories/in-memory/user.in-memory.repository";
import { DrizzleStartupRepository } from "@/repositories/drizzle/startup.repository";
import { InMemoryStartupRepository } from "@/repositories/in-memory/startup.in-memory.repository";
import { DrizzleCommentRepository } from "@/repositories/drizzle/comment.repository";
import { InMemoryCommentRepository } from "@/repositories/in-memory/comment.in-memory.repository";
import { DrizzleMessageRepository } from "@/repositories/drizzle/message.repository";
import { InMemoryMessageRepository } from "@/repositories/in-memory/message.in-memory.repository";

// Security & Infrastructure
import { defaultPasswordHasher } from "@/core/security/password-hasher";
import { defaultSessionManager } from "@/core/session/session-manager";

// Services
import { AuthService } from "@/services/auth.service";
import { StartupService } from "@/services/startup.service";
import { CommentService } from "@/services/comment.service";
import { MessageService } from "@/services/message.service";

/**
 * Service & Repository Container implementing Dependency Inversion Principle (DIP)
 */
class ServiceContainer {
  public readonly userRepository: IUserRepository;
  public readonly startupRepository: IStartupRepository;
  public readonly commentRepository: ICommentRepository;
  public readonly messageRepository: IMessageRepository;

  public readonly authService: IAuthService;
  public readonly startupService: IStartupService;
  public readonly commentService: ICommentService;
  public readonly messageService: IMessageService;

  constructor() {
    const isDbConnected = Boolean(db);

    // 1. Instantiate concrete repositories based on database connectivity (LSP)
    this.userRepository = isDbConnected
      ? new DrizzleUserRepository()
      : new InMemoryUserRepository();

    this.startupRepository = isDbConnected
      ? new DrizzleStartupRepository()
      : new InMemoryStartupRepository();

    this.commentRepository = isDbConnected
      ? new DrizzleCommentRepository()
      : new InMemoryCommentRepository();

    this.messageRepository = isDbConnected
      ? new DrizzleMessageRepository()
      : new InMemoryMessageRepository();

    // 2. Inject repositories into pure business domain services (DIP)
    this.authService = new AuthService(
      this.userRepository,
      defaultPasswordHasher,
      defaultSessionManager
    );

    this.startupService = new StartupService(this.startupRepository);
    this.commentService = new CommentService(this.commentRepository);
    this.messageService = new MessageService(this.messageRepository);
  }
}

// Global Singleton Container Instance
export const container = new ServiceContainer();

// Convenience Service Exports
export const authService = container.authService;
export const startupService = container.startupService;
export const commentService = container.commentService;
export const messageService = container.messageService;

// Convenience Repository Exports
export const userRepository = container.userRepository;
export const startupRepository = container.startupRepository;
export const commentRepository = container.commentRepository;
export const messageRepository = container.messageRepository;
