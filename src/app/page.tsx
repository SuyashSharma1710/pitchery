import HeroBanner from "@/components/hero-banner";
import SearchBar from "@/components/search-bar";
import StartupCard from "@/components/startup-card";
import { startupService } from "@/core/container";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ query?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = params.query || "";
  const category = params.category || "";

  const startups = await startupService.getStartups({ query, category });

  return (
    <div className="w-full pb-20">
      {/* Hero Banner with Pinstripes & Search Bar */}
      <HeroBanner
        badgeText="PITCH, VOTE, AND GROW"
        title="PITCH YOUR STARTUP, CONNECT WITH ENTREPRENEURS"
        subtitle="Submit Ideas, Vote on Pitches, and Get Noticed in Virtual Competitions"
      >
        <SearchBar initialQuery={query} />
      </HeroBanner>

      {/* Main Pitch Feed Grid */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            {query ? `Search results for "${query}"` : "Recommended startups"}
          </h2>

          <div className="flex items-center gap-3">
            <a
              href="/explore"
              className="text-xs font-black uppercase tracking-wider text-[#EE2B69] hover:underline flex items-center gap-1"
            >
              Filter & Sort All Pitches →
            </a>
            <span className="text-xs font-black uppercase tracking-wider bg-white border-2 border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_#000000]">
              {startups.length} {startups.length === 1 ? "Startup" : "Startups"} Listed
            </span>
          </div>
        </div>

        {startups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        ) : (
          <div className="w-full bg-white border-[3px] border-black rounded-[28px] p-12 text-center shadow-[6px_6px_0px_0px_#000000] max-w-xl mx-auto my-8">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-black text-black mb-2">No startups found</h3>
            <p className="text-sm font-semibold text-gray-600 mb-6">
              {query
                ? `We couldn't find any pitches matching "${query}". Try searching for another topic or category.`
                : "No startup pitches have been published yet. Be the first founder to pitch!"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
