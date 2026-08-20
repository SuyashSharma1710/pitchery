import { Comment, User } from "@/types";
import {
  ICommentRepository,
  CommentCreateEntity,
} from "@/core/interfaces/comment.interface";
import { SAMPLE_USERS } from "@/db/sample-data";

const DEFAULT_IN_MEMORY_COMMENTS: Comment[] = [
  {
    id: "comment-1",
    startupId: "startup-1",
    userId: "user_steven_smith",
    content:
      "Love the emphasis on real-world projects! Are you planning to add support for Next.js 15 Server Actions and Neon DB modules in the upcoming cohort?",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    user: SAMPLE_USERS[2],
  },
];

export class InMemoryCommentRepository implements ICommentRepository {
  private comments: Comment[];
  private users: User[];

  constructor(
    initialComments: Comment[] = DEFAULT_IN_MEMORY_COMMENTS,
    initialUsers: User[] = SAMPLE_USERS
  ) {
    this.comments = [...initialComments];
    this.users = [...initialUsers];
  }

  private attachUser(comment: Comment): Comment {
    const user = comment.user || this.users.find((u) => u.id === comment.userId);
    return { ...comment, user };
  }

  async findByStartupId(startupId: string): Promise<Comment[]> {
    return this.comments
      .filter((c) => c.startupId === startupId)
      .map((c) => this.attachUser(c))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async findById(id: string): Promise<Comment | null> {
    const found = this.comments.find((c) => c.id === id);
    if (!found) return null;
    return this.attachUser(found);
  }

  async create(entity: CommentCreateEntity): Promise<Comment> {
    const user = this.users.find((u) => u.id === entity.userId);
    const newComment: Comment = {
      id: entity.id,
      startupId: entity.startupId,
      userId: entity.userId,
      content: entity.content.trim(),
      createdAt: new Date().toISOString(),
      user,
    };

    this.comments.unshift(newComment);
    return this.attachUser(newComment);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.comments.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.comments.splice(index, 1);
    return true;
  }
}
