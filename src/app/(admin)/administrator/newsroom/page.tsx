'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, Edit2, Loader2, Save, X, Star } from 'lucide-react';
import { AdminMediaSelector } from '@/components/AdminMediaSelector';
import { 
  getBlogPostsAction, 
  createBlogPostAction, 
  updateBlogPostAction, 
  deleteBlogPostAction 
} from '@/features/blog/actions/blog';
import { DatabaseBlogPost as BlogPost } from '@/types/database';

export default function AdminNewsroomPage() {
  const { 
    blogPosts, 
    setBlogPosts, 
    addBlogPost, 
    removeBlogPost, 
    updateBlogPost 
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogPostsAction();
        setBlogPosts(data);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [setBlogPosts]);

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setImageUrl('');
    setIsPublished(true);
    setIsFeatured(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setImageUrl(post.image_url || '');
    setIsPublished(post.is_published);
    setIsFeatured(!!post.is_featured);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || (content.substring(0, 150) + '...'),
        content: content.trim(),
        image_url: imageUrl.trim() || '',
        is_published: isPublished,
        is_featured: isFeatured,
        category_id: null,
      };

      if (editingId) {
        const res = await updateBlogPostAction(editingId, payload);
        if (res.success && res.data) {
          updateBlogPost(editingId, res.data);
          setDialogOpen(false);
        } else {
          alert('Failed to update: ' + (res.error || 'Unknown error'));
        }
      } else {
        const res = await createBlogPostAction(payload);
        if (res.success && res.data) {
          addBlogPost(res.data);
          setDialogOpen(false);
        } else {
          alert('Failed to create: ' + (res.error || 'Unknown error'));
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Action error: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const res = await deleteBlogPostAction(id);
      if (res.success) {
        removeBlogPost(id);
      } else {
        alert('Failed to delete: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Delete error: ' + (err.message || err));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#d4af37] mb-4" size={32} />
        <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest leading-none">Loading Newsroom CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest mb-1">Articles CMS</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Newsroom CMS</h1>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-[#d4af37] hover:bg-[#b08f24] text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> Write Article
        </button>
      </header>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#262626]">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Dynamic Editorial Articles ({blogPosts.length})</h3>
        </div>

        {blogPosts.length === 0 ? (
          <div className="p-12 text-center text-text-sub">
            <p className="text-sm font-bold uppercase tracking-wider mb-2">No editorial posts found</p>
            <p className="text-xs text-[#525252]">Add blog posts and strategic highlights to power the user-facing Newsroom.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {blogPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-white/[0.01] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  {post.image_url && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#262626] shrink-0 bg-[#141414]">
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${post.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                      {post.is_featured && (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                          <Star size={8} fill="currentColor" /> Featured
                        </span>
                      )}
                      <span className="text-[10px] text-text-sub font-mono">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-white text-base font-bold tracking-tight">{post.title}</h4>
                    <p className="text-xs text-text-sub line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="p-3 bg-[#111] hover:bg-[#222] text-[#A3A3A3] hover:text-white rounded-xl border border-[#262626] transition-colors"
                    title="Edit Post"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-3 bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/20 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#050b14] border border-[#262626] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {editingId ? 'Edit Editorial Post' : 'New Editorial Post'}
              </h2>
              <button 
                onClick={() => setDialogOpen(false)}
                className="text-[#525252] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Post Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Smart agri-tech innovations commence"
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Brief Excerpt</label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Optional short hook summary text of the article..."
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Full Markdown Body</label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Supports full typographic markup..."
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all resize-none font-mono text-xs"
                />
              </div>

              <AdminMediaSelector
                label="Article Header Cover Image"
                value={imageUrl}
                onChange={setImageUrl}
                type="image"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-t border-[#262626] mt-4">
                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-[#262626]">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-white uppercase tracking-wider">Publish Directly</span>
                    <span className="block text-[10px] text-[#A3A3A3]">Show immediately inside the Newsroom channel feed.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-200 outline-none ${isPublished ? 'bg-emerald-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-[#262626]">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-white uppercase tracking-wider">Featured Cover</span>
                    <span className="block text-[10px] text-[#A3A3A3]">Promotes article into the primary large-screen display spotlight banner.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-200 outline-none ${isFeatured ? 'bg-[#d4af37]' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="bg-[#111] hover:bg-[#222] text-white border border-[#262626] text-xs font-black uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#d4af37] hover:bg-[#b08f24] text-black text-xs font-black uppercase tracking-widest px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin text-black" size={16} /> : <Save size={16} />}
                  {editingId ? 'Modify Article' : 'Promote Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
