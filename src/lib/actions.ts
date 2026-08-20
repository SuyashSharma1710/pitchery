"use server";

import {
  authService,
  startupService,
  commentService,
  messageService,
} from "@/core/container";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { startupFormSchema } from "./validation";
import { ActionResponse } from "@/core/interfaces/common.interface";
import { User, Startup, Comment, Reachout, ReachoutReply } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type { ActionResponse };

// ----------------------------------------------------
// 1. Authentication Actions
// ----------------------------------------------------
export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<User>> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { status: "ERROR", error: "Please provide both email and password." };
  }

  try {
    const session = await authService.login({ email, password });
    await setSessionCookie(session.token);

    revalidatePath("/");
    return { status: "SUCCESS", data: session.user };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to log in.";
    return { status: "ERROR", error };
  }
}

export async function registerAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<User>> {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const bio = formData.get("bio") as string;
  const image = formData.get("image") as string;

  if (!name || !username || !email || !password) {
    return { status: "ERROR", error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return { status: "ERROR", error: "Password must be at least 6 characters long." };
  }

  try {
    const user = await authService.register({ name, username, email, password, bio, image });
    const session = await authService.login({ email, password });
    await setSessionCookie(session.token);

    revalidatePath("/");
    return { status: "SUCCESS", data: user };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to create account.";
    return { status: "ERROR", error };
  }
}

export async function quickDemoLoginAction(userId: string): Promise<ActionResponse<User>> {
  try {
    const user = await authService.getUserById(userId);
    if (!user) throw new Error("Demo user not found.");

    const session = await authService.login({ email: user.email, password: "" });
    await setSessionCookie(session.token);

    revalidatePath("/");
    return { status: "SUCCESS", data: user };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Demo login failed.";
    return { status: "ERROR", error };
  }
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/");
  redirect("/");
}

// ----------------------------------------------------
// 2. Pitch CRUD Actions
// ----------------------------------------------------
export async function createStartupAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<Startup>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be signed in to submit a pitch." };
  }

  const rawValues = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    image: formData.get("image") as string,
    pitch: formData.get("pitch") as string,
  };

  const validation = startupFormSchema.safeParse(rawValues);
  if (!validation.success) {
    return {
      status: "ERROR",
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const startup = await startupService.createStartup({
      ...validation.data,
      authorId: user.id,
    });

    revalidatePath("/");
    revalidatePath(`/user/${user.id}`);
    revalidatePath(`/startup/${startup.id}`);

    return { status: "SUCCESS", data: startup };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to create pitch.";
    return { status: "ERROR", error };
  }
}

export async function updateStartupAction(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<Startup>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be signed in to update your pitch." };
  }

  const rawValues = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    image: formData.get("image") as string,
    pitch: formData.get("pitch") as string,
  };

  const validation = startupFormSchema.safeParse(rawValues);
  if (!validation.success) {
    return {
      status: "ERROR",
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const updated = await startupService.updateStartup({
      id,
      ...validation.data,
      authorId: user.id,
    });

    revalidatePath("/");
    revalidatePath(`/user/${user.id}`);
    revalidatePath(`/startup/${id}`);

    return { status: "SUCCESS", data: updated };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to update pitch.";
    return { status: "ERROR", error };
  }
}

export async function deleteStartupAction(id: string): Promise<ActionResponse<void>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be signed in to delete this pitch." };
  }

  try {
    await startupService.deleteStartup(id, user.id);
    revalidatePath("/");
    revalidatePath(`/user/${user.id}`);
    return { status: "SUCCESS" };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to delete pitch.";
    return { status: "ERROR", error };
  }
}

export async function incrementViewsAction(id: string): Promise<number> {
  try {
    return await startupService.incrementViews(id);
  } catch {
    return 0;
  }
}

// ----------------------------------------------------
// 3. Public Comment Actions
// ----------------------------------------------------
export async function createCommentAction(
  startupId: string,
  content: string
): Promise<ActionResponse<Comment>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be logged in to leave a comment." };
  }

  if (!content || content.trim().length === 0) {
    return { status: "ERROR", error: "Comment cannot be empty." };
  }

  try {
    const comment = await commentService.createComment({
      startupId,
      userId: user.id,
      content,
    });

    revalidatePath(`/startup/${startupId}`);
    return { status: "SUCCESS", data: comment };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to post comment.";
    return { status: "ERROR", error };
  }
}

export async function deleteCommentAction(
  commentId: string,
  startupId: string
): Promise<ActionResponse<void>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be signed in." };
  }

  try {
    await commentService.deleteComment(commentId, user.id);
    revalidatePath(`/startup/${startupId}`);
    return { status: "SUCCESS" };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to delete comment.";
    return { status: "ERROR", error };
  }
}

// ----------------------------------------------------
// 4. Private Reach Out & Conversation Actions (Reachout Revert)
// ----------------------------------------------------
export async function createReachoutAction(
  receiverId: string,
  startupId: string | null,
  payload: { senderName: string; senderEmail: string; subject: string; message: string }
): Promise<ActionResponse<Reachout>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be signed in to send reachouts to founders." };
  }

  if (!payload.senderName || !payload.senderEmail || !payload.subject || !payload.message) {
    return { status: "ERROR", error: "Please complete all fields to send your message." };
  }

  try {
    const reachout = await messageService.createReachout({
      senderId: user.id,
      receiverId,
      startupId,
      senderName: payload.senderName,
      senderEmail: payload.senderEmail,
      subject: payload.subject,
      message: payload.message,
    });

    revalidatePath(`/user/${receiverId}`);
    revalidatePath(`/user/${user.id}`);
    if (startupId) revalidatePath(`/startup/${startupId}`);

    return { status: "SUCCESS", data: reachout };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to send reachout message.";
    return { status: "ERROR", error };
  }
}

export async function toggleTalkMoreAction(
  reachoutId: string,
  status: "ACCEPTED" | "DECLINED"
): Promise<ActionResponse<Reachout>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "Unauthorized." };
  }

  try {
    const updated = await messageService.toggleTalkMore(reachoutId, status, user.id);
    revalidatePath(`/user/${user.id}`);
    if (updated.senderId) revalidatePath(`/user/${updated.senderId}`);
    return { status: "SUCCESS", data: updated };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to update status.";
    return { status: "ERROR", error };
  }
}

export async function sendReachoutReplyAction(
  reachoutId: string,
  message: string
): Promise<ActionResponse<ReachoutReply>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be signed in to reply." };
  }

  if (!message.trim()) {
    return { status: "ERROR", error: "Message cannot be empty." };
  }

  try {
    const reply = await messageService.sendReply({
      reachoutId,
      senderId: user.id,
      message,
    });

    revalidatePath(`/user/${user.id}`);
    return { status: "SUCCESS", data: reply };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to send reply.";
    return { status: "ERROR", error };
  }
}

export async function getReachoutThreadAction(
  reachoutId: string
): Promise<ActionResponse<Reachout>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "Unauthorized." };
  }

  try {
    const reachout = await messageService.getReachoutById(reachoutId, user.id);
    if (!reachout) {
      return { status: "ERROR", error: "Thread not found." };
    }
    return { status: "SUCCESS", data: reachout };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to fetch thread.";
    return { status: "ERROR", error };
  }
}

export async function checkPitchReachoutStatusAction(
  startupId: string
): Promise<ActionResponse<{ hasSent: boolean; reachout: Reachout | null }>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "SUCCESS", data: { hasSent: false, reachout: null } };
  }

  try {
    const existing = await messageService.checkExistingReachout(user.id, startupId);
    return {
      status: "SUCCESS",
      data: {
        hasSent: Boolean(existing),
        reachout: existing,
      },
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to check status.";
    return { status: "ERROR", error };
  }
}

export async function getLiveUnreadCountAction(): Promise<ActionResponse<number>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "SUCCESS", data: 0 };
  }

  try {
    const count = await messageService.getUnreadCount(user.id);
    return { status: "SUCCESS", data: count };
  } catch {
    return { status: "SUCCESS", data: 0 };
  }
}

export async function markReachoutAsReadAction(messageId: string): Promise<ActionResponse<void>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "Unauthorized." };
  }

  try {
    await messageService.markAsRead(messageId, user.id);
    revalidatePath(`/user/${user.id}`);
    return { status: "SUCCESS" };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to mark message as read.";
    return { status: "ERROR", error };
  }
}

// ----------------------------------------------------
// 5. User Profile Update Action
// ----------------------------------------------------
export async function updateUserBioAction(bio: string): Promise<ActionResponse<User>> {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { status: "ERROR", error: "You must be signed in to update your bio." };
  }

  try {
    const updated = await authService.updateProfile(user.id, { bio });
    revalidatePath(`/user/${user.id}`);
    return { status: "SUCCESS", data: updated };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Failed to update bio.";
    return { status: "ERROR", error };
  }
}
