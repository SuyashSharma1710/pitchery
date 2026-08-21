import { notFound, redirect } from "next/navigation";
import { startupService } from "@/core/container";
import { getCurrentUser } from "@/lib/auth";
import EditStartupForm from "./edit-startup-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Startup Pitch | Pitchery",
  description: "Update and refine your startup pitch on Pitchery",
};

export default async function EditStartupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/startup/${id}/edit`)}`);
  }

  const startup = await startupService.getStartupById(id);
  if (!startup) {
    notFound();
  }

  if (startup.authorId !== user.id) {
    redirect(`/startup/${id}`);
  }

  return (
    <div className="w-full pb-20">
      {/* Pink Striped Hero Banner Matching Create View */}
      <section className="bg-pinstripe w-full py-12 px-4 sm:px-6 lg:px-8 border-b-[3px] border-black text-center flex flex-col items-center justify-center">
        <div className="inline-block bg-black text-white px-8 py-3 rounded-none border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-wider">
          EDIT YOUR STARTUP PITCH
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        <EditStartupForm startup={startup} />
      </main>
    </div>
  );
}
