import { IUserRepository, IAuthService } from "@/core/interfaces/auth.interface";
import { IStartupRepository, IStartupService } from "@/core/interfaces/startup.interface";
import { ICommentRepository, ICommentService } from "@/core/interfaces/comment.interface";
import { IMessageRepository, IMessageService } from "@/core/interfaces/message.interface";

// Repositories
import { DrizzleUserRepository } from "@/repositories/drizzle/user.repository";
import { DrizzleStartupRepository } from "@/repositories/drizzle/startup.repository";
import { DrizzleCommentRepository } from "@/repositories/drizzle/comment.repository";
import { DrizzleMessageRepository } from "@/repositories/drizzle/message.repository";

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
    // Concrete Drizzle Repositories connected directly to PostgreSQL database
    this.userRepository = new DrizzleUserRepository();
    this.startupRepository = new DrizzleStartupRepository();
    this.commentRepository = new DrizzleCommentRepository();
    this.messageRepository = new DrizzleMessageRepository();

    // Inject repositories into pure business domain services (DIP)
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
