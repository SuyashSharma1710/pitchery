import { ReactNode } from "react";

interface HeroBannerProps {
  badgeText?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function HeroBanner({
  badgeText,
  title,
  subtitle,
  children,
}: HeroBannerProps) {
  return (
    <section className="w-full bg-pinstripe border-b-[3px] border-black py-12 md:py-16 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        {/* Folded Badge Tag */}
        {badgeText && (
          <div className="relative inline-block mb-1">
            <span className="tag-folded px-4 py-1.5 text-xs font-black tracking-widest shadow-[3px_3px_0px_0px_#000000]">
              {badgeText}
            </span>
          </div>
        )}

        {/* High-Contrast Black Title Box */}
        <div className="bg-black text-white px-6 py-3.5 md:px-10 md:py-4 border-2 border-black shadow-[5px_5px_0px_0px_#000000] max-w-3xl">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            {title}
          </h1>
        </div>

        {/* Subtitle Description */}
        {subtitle && (
          <p className="text-white text-sm md:text-base font-semibold max-w-2xl text-shadow-sm mt-1">
            {subtitle}
          </p>
        )}

        {/* Optional Interactive Slots (e.g., Search Bar) */}
        {children && <div className="w-full mt-4">{children}</div>}
      </div>
    </section>
  );
}
