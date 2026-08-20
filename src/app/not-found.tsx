import Link from "next/link";
import HeroBanner from "@/components/hero-banner";

export default function NotFound() {
  return (
    <div className="w-full pb-20">
      <HeroBanner
        badgeText="ERROR 404"
        title="STARTUP NOT FOUND"
        subtitle="The pitch or page you are looking for does not exist or has been removed."
      />

      <div className="max-w-xl mx-auto px-6 pt-12 text-center">
        <div className="bg-white border-[3px] border-black rounded-[28px] p-8 md:p-12 shadow-[6px_6px_0px_0px_#000000]">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-black text-black mb-3">Page Missing</h2>
          <p className="text-sm font-semibold text-gray-700 mb-8 leading-relaxed">
            Looks like this startup pitch hasn&apos;t been submitted yet, or the URL is incorrect.
          </p>

          <Link
            href="/"
            className="inline-block bg-[#EE2B69] text-white border-[3px] border-black rounded-full px-8 py-3.5 font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 transition-all"
          >
            Back to Home Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
