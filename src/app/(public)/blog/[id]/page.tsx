'use client';

import React, { use } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = use(params);
  const { blogPosts } = useAppStore();
  
  const post = blogPosts.find(p => p.id === id);

  if (!post || post.is_published === false) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-white mb-4">404 - Article Not Found</h1>
        <p className="text-gray-400 mb-8">The news article you are looking for does not exist or has been removed.</p>
        <Link href="/blog" className="px-6 py-3 bg-sidebar border border-[#262626] text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
          &larr; Back to Newsroom
        </Link>
      </div>
    );
  }

  return (
    <article className="animate-in fade-in duration-500 pb-24 bg-bg min-h-screen">
      {/* Hero Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-40 md:pt-48 pb-8 md:pb-12 animate-in fade-in">
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-[#A3A3A3] hover:text-[#d4af37] transition-colors mb-6 md:mb-8">
          <ArrowLeft size={16} /> Back to Newsroom
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-[#A3A3A3] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6">
          <Calendar size={14} className="w-3.5 h-3.5 animate-pulse" />
          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {post.is_featured && <span className="ml-2 px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] rounded-sm">Featured</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6 sm:mb-8 overflow-hidden line-clamp-4 md:line-clamp-none">
          {post.title}
        </h1>
      </header>

      {/* Featured Image */}
      {post.image_url && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-10 md:mb-16">
          <div className="w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-black border border-border">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="prose prose-sm sm:prose-base md:prose-lg text-white leading-relaxed">
          <p className="text-lg sm:text-xl text-[#A3A3A3] font-medium mb-6 sm:mb-8 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="whitespace-pre-wrap text-[#d4d4d4] leading-relaxed">
            {post.content}
            
            {post.content === 'Full content goes here...' && (
              <>
                <p className="mt-8 text-gray-300">The gallery dynamics have completely shifted this week. As the voting engine runs hot, we see unprecedented shifts in fan support across the major tiers. Early leaders are finding themselves struggling to maintain momentum, while lower-tier participants have successfully mobilized their fanbases.</p>
                <h3 className="text-2xl font-bold mt-12 mb-4 text-[#d4af37]">What it means for the hierarchy</h3>
                <p className="text-gray-300">Because the Next Billionaire Path uses a verified Paystack-driven voting mechanism, every shift in the rankings represents documented, paid support. This creates a deeply invested community and ensures the metrics reflect raw market value rather than manipulated statistics.</p>
                <blockquote className="border-l-4 border-[#d4af37] pl-6 py-2 my-8 text-xl font-medium italic text-gray-400 bg-black/40 rounded-r-lg">
                  "We are searching for the anomaly. The entrepreneur who refuses to conform, ready to shatter paradigms and forge the Next Billionaire Path."
                </blockquote>
                <p className="text-gray-300">Going into the weekend, administrators state that the eviction protocol will remain stringently tied to the 48-hour cutoff window. Stay tuned as we update the Master Gallery.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
