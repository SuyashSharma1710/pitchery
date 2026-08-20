import { Comment } from "@/types";

export interface CreateCommentDTO {
  startupId: string;
  userId: string;
  content: string;
}

export interface CommentCreateEntity {
  id: string;
  startupId: string;
  userId: string;
  content: string;
}

/**
 * Data Access Contract for Comments (Repository Pattern)
 */
export interface ICommentRepository {
  findByStartupId(startupId: string): Promise<Comment[]>;
  findById(id: string): Promise<Comment | null>;
  create(entity: CommentCreateEntity): Promise<Comment>;
  delete(id: string): Promise<boolean>;
}

/**
 * High-level business contract for Comments
 */
export interface ICommentService {
  getCommentsByStartupId(startupId: string): Promise<Comment[]>;
  createComment(dto: CreateCommentDTO): Promise<Comment>;
  deleteComment(commentId: string, userId: string): Promise<boolean>;
}
