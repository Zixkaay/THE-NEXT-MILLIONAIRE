import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Calendar } from 'lucide-react';

export function BlogPostPage() {
  const { id } = useParams();
  const { blogPosts } = useAppStore();
  
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-text-main mb-4">404 - Article Not Found</h1>
        <p className="text-text-sub mb-8">The news article you are looking for does not exist or has been removed.</p>
        <Link to="/blog" className="px-6 py-3 bg-sidebar text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
          &larr; Back to Newsroom
        </Link>
      </div>
    );
  }

  return (
    <article className="animate-in fade-in duration-500 pb-24 bg-bg min-h-screen">
      {/* Hero Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8 md:pb-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-text-sub hover:text-accent transition-colors mb-6 md:mb-8">
          <ArrowLeft size={16} /> Back to Newsroom
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-text-sub text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6">
          <Calendar size={14} className="w-3.5 h-3.5" />
          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {post.is_featured && <span className="ml-2 px-2 py-0.5 bg-accent/10 text-accent rounded-sm">Featured</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-text-main leading-tight tracking-tight mb-6 sm:mb-8 overflow-hidden line-clamp-4 md:line-clamp-none">
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
        <div className="prose prose-sm sm:prose-base md:prose-lg text-text-main leading-relaxed">
          <p className="text-lg sm:text-xl text-text-sub font-medium mb-6 sm:mb-8 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="whitespace-pre-wrap text-[#d4d4d4]">
            {post.content}
            
            {/* Adding some mock content so the page isn't totally empty if the store just has 'Full content goes here...' */}
            {post.content === 'Full content goes here...' && (
              <>
                <p className="mt-8">The gallery dynamics have completely shifted this week. As the voting engine runs hot, we see unprecedented shifts in fan support across the major tiers. Early leaders are finding themselves struggling to maintain momentum, while lower-tier participants have successfully mobilized their fanbases.</p>
                <h3 className="text-2xl font-bold mt-12 mb-4">What it means for the hierarchy</h3>
                <p>Because the Next Billionaire Path uses a verified Paystack-driven voting mechanism, every shift in the rankings represents documented, paid support. This creates a deeply invested community and ensures the metrics reflect raw market value rather than manipulated statistics.</p>
                <blockquote className="border-l-4 border-accent pl-6 py-2 my-8 text-xl font-medium italic text-slate-600 bg-slate-50 rounded-r-lg">
                  "We are searching for the anomaly. The entrepreneur who refuses to conform, ready to shatter paradigms and forge the Next Billionaire Path."
                </blockquote>
                <p>Going into the weekend, administrators state that the eviction protocol will remain stringently tied to the 48-hour cutoff window. Stay tuned as we update the Master Gallery.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
