import { Comment } from "@/types";
import {
  ICommentService,
  CreateCommentDTO,
  ICommentRepository,
} from "@/core/interfaces/comment.interface";

export class CommentService implements ICommentService {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async getCommentsByStartupId(startupId: string): Promise<Comment[]> {
    return await this.commentRepository.findByStartupId(startupId);
  }

  async createComment(dto: CreateCommentDTO): Promise<Comment> {
    const commentId = "comment-" + Math.random().toString(36).substring(2, 9);
    return await this.commentRepository.create({
      id: commentId,
      startupId: dto.startupId,
      userId: dto.userId,
      content: dto.content.trim(),
    });
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const existing = await this.commentRepository.findById(commentId);
    if (!existing) return false;

    if (existing.userId !== userId) {
      throw new Error("Unauthorized. You can only delete your own comments.");
    }

    return await this.commentRepository.delete(commentId);
  }
}
