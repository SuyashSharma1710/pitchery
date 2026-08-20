import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import HeroBanner from "@/components/hero-banner";
import MarkdownRenderer from "@/components/markdown-renderer";
import StartupCard from "@/components/startup-card";
import ViewCounter from "@/components/view-counter";
import CommentSection from "@/components/comments/comment-section";
import ReachoutModal from "@/components/reachout/reachout-modal";
import StartupActions from "@/components/startup/startup-actions";
import { startupService, commentService } from "@/core/container";
import { getCurrentUser } from "@/lib/auth";
import { formatDateUppercase } from "@/lib/utils";
import type { Metadata } from "next";

interface StartupPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: StartupPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const startup = await startupService.getStartupById(id);

    if (!startup) {
      return {
        title: "Startup Not Found | Pitchery",
      };
    }

    return {
      title: `${startup.title} | Pitchery`,
      description: startup.description,
    };
  } catch {
    return {
      title: "Startup Pitch | Pitchery",
    };
  }
}

export default async function StartupDetailsPage({ params }: StartupPageProps) {
  const { id } = await params;
  const startup = await startupService.getStartupById(id);

  if (!startup) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const comments = await commentService.getCommentsByStartupId(startup.id);
  const similarStartups = await startupService.getSimilarStartups(startup.category, startup.id);

  const { title, description, category, image, pitch, views, createdAt, author } = startup;

  const authorName = author?.name || "Anonymous Founder";
  const authorHandle = author?.username || "founder";
  const authorImage =
    author?.image ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
  const authorId = author?.id || "anonymous";

  return (
    <div className="w-full pb-24">
      {/* Hero Banner with Folded Date Tag and Title */}
      <HeroBanner
        badgeText={formatDateUppercase(createdAt)}
        title={title}
        subtitle={description}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Media Showcase Container */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/10] bg-[#141413] border-[3px] border-black rounded-[24px] overflow-hidden shadow-[6px_6px_0px_0px_#000000] mb-8">
          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {/* Author Bio, Category Pill & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-b-2 border-black/10">
          {/* Left: Author Profile */}
          <Link href={`/user/${authorId}`} className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-[#FBE843] flex-shrink-0 shadow-[2px_2px_0px_0px_#000000] group-hover:scale-105 transition-transform">
              <Image
                src={authorImage}
                alt={authorName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-black group-hover:text-[#EE2B69] transition-colors leading-tight">
                {authorName}
              </h4>
              <p className="text-xs font-semibold text-gray-600">
                @{authorHandle}
              </p>
            </div>
          </Link>

          {/* Right: Category Pill + Reach Out + Author Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#FFE4E6] text-black border-[2px] border-black px-4 py-1.5 rounded-full text-xs font-black tracking-wide">
              {category}
            </span>

            {/* Reach Out to Founder Modal Trigger */}
            {author && author.id !== currentUser?.id && (
              <ReachoutModal
                founder={author}
                startup={startup}
                currentUser={currentUser}
              />
            )}

            {/* Author Pitch CRUD Controls */}
            <StartupActions
              startupId={startup.id}
              authorId={startup.authorId}
              currentUserId={currentUser?.id}
              startupTitle={startup.title}
            />
          </div>
        </div>

        {/* Pitch Breakdown Content */}
        <div className="bg-white border-[3px] border-black rounded-[24px] p-6 md:p-10 shadow-[6px_6px_0px_0px_#000000] mb-12">
          <MarkdownRenderer content={pitch} />
        </div>

        {/* Public Pitch Discussion & Comments */}
        <CommentSection
          startupId={startup.id}
          initialComments={comments}
          currentUser={currentUser}
        />

        {/* Similar Startups Section */}
        {similarStartups.length > 0 && (
          <section className="pt-12 mt-12 border-t-2 border-black/15">
            <h3 className="text-2xl font-black text-black tracking-tight mb-6 uppercase">
              Similar startups
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarStartups.map((item) => (
                <StartupCard key={item.id} startup={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Real-time View Counter */}
      <ViewCounter id={startup.id} initialViews={views} />
    </div>
  );
}
