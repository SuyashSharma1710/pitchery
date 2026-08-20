import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose-brutal w-full font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ ...props }: ComponentPropsWithoutRef<"h1">) => (
            <h1 className="text-2xl md:text-3xl font-black text-black mt-6 mb-3 tracking-tight" {...props} />
          ),
          h2: ({ ...props }: ComponentPropsWithoutRef<"h2">) => (
            <h2 className="text-xl md:text-2xl font-extrabold text-black mt-5 mb-2.5" {...props} />
          ),
          h3: ({ ...props }: ComponentPropsWithoutRef<"h3">) => (
            <h3 className="text-lg md:text-xl font-bold text-black mt-4 mb-2" {...props} />
          ),
          p: ({ ...props }: ComponentPropsWithoutRef<"p">) => (
            <p className="text-sm md:text-base leading-relaxed text-black/90 mb-4 font-normal" {...props} />
          ),
          strong: ({ ...props }: ComponentPropsWithoutRef<"strong">) => (
            <strong className="font-extrabold text-black" {...props} />
          ),
          em: ({ ...props }: ComponentPropsWithoutRef<"em">) => (
            <em className="italic text-black/90" {...props} />
          ),
          ul: ({ ...props }: ComponentPropsWithoutRef<"ul">) => (
            <ul className="list-disc list-inside space-y-1.5 mb-4 text-black/90 text-sm md:text-base" {...props} />
          ),
          ol: ({ ...props }: ComponentPropsWithoutRef<"ol">) => (
            <ol className="list-decimal list-inside space-y-1.5 mb-4 text-black/90 text-sm md:text-base" {...props} />
          ),
          li: ({ ...props }: ComponentPropsWithoutRef<"li">) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ ...props }: ComponentPropsWithoutRef<"blockquote">) => (
            <blockquote className="border-l-4 border-[#EE2B69] bg-[#FFF1F2] p-4 my-4 rounded-r-xl font-medium italic text-black/85" {...props} />
          ),
          a: ({ ...props }: ComponentPropsWithoutRef<"a">) => (
            <a className="text-[#EE2B69] underline font-bold hover:text-black transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: ({ ...props }: ComponentPropsWithoutRef<"code">) => (
            <code className="bg-gray-100 text-black px-1.5 py-0.5 rounded text-xs md:text-sm font-mono border border-gray-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
