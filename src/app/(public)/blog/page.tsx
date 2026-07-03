'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const { blogPosts } = useAppStore();
  
  // Filter for only published publications/articles
  const publishedPosts = blogPosts.filter(p => p.is_published !== false);

  if (publishedPosts.length === 0) {
    return (
      <div className="animate-in fade-in duration-500 pb-24 bg-bg">
        <section className="bg-sidebar pt-40 md:pt-48 pb-32 px-6 text-center border-b border-border">
           <h1 className="text-5xl md:text-7xl font-black text-text-main tracking-tighter mb-4">The Newsroom</h1>
           <p className="text-lg text-text-sub max-w-2xl mx-auto">Latest updates, evictions, and behind-the-scenes insights from the Next Billionaire Path.</p>
        </section>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center text-text-sub text-sm">
          No articles have been published to the Newsroom yet. Please check back later.
        </div>
      </div>
    );
  }

  const featured = publishedPosts.find(p => p.is_featured) || publishedPosts[0];
  const others = publishedPosts.filter(p => p.id !== featured.id);

  return (
    <div className="animate-in fade-in duration-500 pb-24 bg-bg">
      <section className="bg-sidebar pt-40 md:pt-48 pb-32 px-6 text-center border-b border-border">
         <h1 className="text-5xl md:text-7xl font-black text-text-main tracking-tighter mb-4">The Newsroom</h1>
         <p className="text-lg text-text-sub max-w-2xl mx-auto">Latest updates, evictions, and behind-the-scenes insights from the Next Billionaire Path.</p>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 space-y-16">
        
        {/* Top Post: "Front Line" */}
        {featured && (
          <Link href={`/blog/${featured.id}`} className="group block bg-card border border-border p-2 rounded-3xl shadow-2xl overflow-hidden hover:border-accent transition-colors">
             <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-black rounded-2xl overflow-hidden relative">
               <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
               <div className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-[#d4af37] text-black font-black text-[10px] sm:text-xs uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm shadow-lg">
                 The Front Line
               </div>
               <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end">
                 <div className="flex items-center gap-2 text-[#d4af37] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3">
                   <Calendar size={14} className="sm:w-3.5 sm:h-3.5 w-3 h-3"/>
                   {new Date(featured.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                 </div>
                 <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-2 sm:mb-4 leading-tight max-w-4xl line-clamp-3 sm:line-clamp-none">{featured.title}</h2>
                 <p className="text-gray-300 max-w-3xl text-sm sm:text-lg line-clamp-2 md:line-clamp-none">{featured.excerpt}</p>
               </div>
             </div>
          </Link>
        )}

        {/* List View */}
        <div className="pt-8">
          <div className="flex gap-4 items-center mb-8 sm:mb-10">
             <h3 className="text-lg sm:text-xl font-black text-text-main uppercase tracking-widest shrink-0">Latest Updates</h3>
             <div className="flex-1 h-px bg-border"></div>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            {others.map(post => (
              <Link href={`/blog/${post.id}`} key={post.id} className="group flex flex-col sm:flex-row gap-4 sm:gap-8 items-center bg-card rounded-2xl overflow-hidden border border-border p-4 hover:border-accent transition-colors">
                <div className="w-full sm:w-[35%] aspect-[16/9] sm:aspect-[4/3] bg-black rounded-xl overflow-hidden shrink-0">
                   <img src={post.image_url} alt={post.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="w-full sm:w-[65%] p-2 sm:p-4 md:pr-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-text-sub text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3">
                    <Calendar size={14} className="w-3.5 h-3.5" />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-main mb-2 sm:mb-4 group-hover:text-[#d4af37] transition-colors leading-snug">{post.title}</h3>
                  <p className="text-text-sub text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6 line-clamp-3">{post.excerpt}</p>
                  
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2 group-hover:gap-4 transition-all w-max bg-sidebar px-4 py-2 rounded-lg">
                    Read Story <ArrowRight size={14} className="text-[#d4af37]" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
