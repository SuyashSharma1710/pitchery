import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import HeroBanner from "@/components/hero-banner";
import StartupForm from "@/components/startup-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit Your Startup Pitch | Pitchery",
  description: "Pitch your startup idea to the Pitchery community of founders and investors.",
};

export default async function CreateStartupPage() {
  const user = await getCurrentUser();

  // Auth Guard: User MUST be logged in before submitting any pitch
  if (!user) {
    redirect("/login?callbackUrl=/startup/create");
  }

  return (
    <div className="w-full pb-20">
      {/* Pink Pinstripe Hero Banner */}
      <HeroBanner title="SUBMIT YOUR STARTUP PITCH" />

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        <StartupForm />
      </div>
    </div>
  );
}
