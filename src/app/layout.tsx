import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://pitchery.vercel.app"
  ),
  title: "Pitchery | Pitch Your Startup, Connect with Entrepreneurs",
  description:
    "Submit startup ideas, vote on pitches, and get noticed in virtual competitions with the Pitchery community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} font-sans`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#F8F8F8] text-black antialiased" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t-[3px] border-black bg-white py-6 text-center text-xs font-bold text-gray-700">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 Pitchery. All rights reserved.</span>
            <span className="text-[#EE2B69] font-black">PITCH, VOTE, AND GROW 🚀</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
