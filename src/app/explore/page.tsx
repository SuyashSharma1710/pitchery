import HeroBanner from "@/components/hero-banner";
import ExploreView from "@/components/explore/explore-view";
import { startupService } from "@/core/container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Startup Pitches | Pitchery",
  description:
    "Explore, filter, and discover breakthrough startup pitches and visionary founders across technology, education, climate, and AI.",
};

export default async function ExplorePage() {
  const startups = await startupService.getStartups();

  return (
    <div className="w-full pb-24">
      {/* Neo-Brutalist Pinstripe Hero Banner */}
      <HeroBanner
        badgeText="DISCOVER & CONNECT"
        title="EXPLORE STARTUP PITCHES"
        subtitle="Search pitches by industry, filter breakthrough ideas, and connect directly with visionary founders."
      />

      {/* Main Filter & Pitches Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <ExploreView initialStartups={startups} />
      </main>
    </div>
  );
}
