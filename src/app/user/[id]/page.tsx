import { notFound } from "next/navigation";
import ProfileCard from "@/components/profile-card";
import ProfileView from "./profile-view";
import { authService, startupService, messageService } from "@/core/container";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";

interface UserPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const user = await authService.getUserById(id);

    if (!user) {
      return {
        title: "User Not Found | Pitchery",
      };
    }

    return {
      title: `${user.name} (@${user.username}) | Pitchery`,
      description: user.bio || `Explore startup pitches created by ${user.name} on Pitchery.`,
    };
  } catch {
    return {
      title: "Founder Profile | Pitchery",
    };
  }
}

export default async function UserProfilePage({ params, searchParams }: UserPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialTab = resolvedSearchParams.tab === "inbox" ? "inbox" : "pitches";
  const user = await authService.getUserById(id);

  if (!user) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const userStartups = await startupService.getStartups({ authorId: user.id });
  const inboxMessages =
    currentUser?.id === user.id ? await messageService.getInboxMessages(user.id) : [];
  const sentMessages =
    currentUser?.id === user.id ? await messageService.getSentReachouts(user.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Sidebar: Founder Profile Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <ProfileCard user={user} isOwner={currentUser?.id === user.id} />
        </div>

        {/* Right Column: Dynamic Pitches & Private Inbox View */}
        <div className="lg:col-span-8">
          <ProfileView
            user={user}
            currentUser={currentUser}
            startups={userStartups}
            inboxMessages={inboxMessages}
            sentMessages={sentMessages}
            initialTab={initialTab}
          />
        </div>
      </div>
    </div>
  );
}
