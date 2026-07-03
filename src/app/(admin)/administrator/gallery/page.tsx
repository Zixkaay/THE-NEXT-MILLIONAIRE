'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, Edit2, Loader2, Save, X, Star } from 'lucide-react';
import { AdminMediaSelector } from '@/components/AdminMediaSelector';
import { 
  getGalleryItemsAction, 
  createGalleryItemAction, 
  updateGalleryItemAction, 
  deleteGalleryItemAction 
} from '@/features/gallery/actions/gallery';
import { DatabaseGalleryItem as GalleryItem } from '@/types/database';

export default function AdminGalleryPage() {
  const { 
    galleryItems, 
    setGalleryItems, 
    addGalleryItem, 
    removeGalleryItem, 
    updateGalleryItemState 
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [featured, setFeatured] = useState(false);
  
  // Helper editor variables for custom formatting
  const [category, setCategory] = useState<'Bootcamp' | 'Gala Night' | 'Boardroom' | 'Masterclass'>('Bootcamp');
  const [descriptionText, setDescriptionText] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    async function loadGallery() {
      try {
        const data = await getGalleryItemsAction();
        setGalleryItems(data);
      } catch (err) {
        console.error('Failed to load gallery items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, [setGalleryItems]);

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle('');
    setUrl('');
    setType('image');
    setFeatured(false);
    setCategory('Bootcamp');
    setDescriptionText('');
    setThumbnailUrl('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setUrl(item.url);
    setType(item.type as 'image' | 'video');
    setFeatured(!!item.featured);

    // Parse out structured category match, body, thumbnail
    const desc = item.description || '';
    const categoryMatch = desc.match(/^\[(.*?)\] (.*)/);
    const parsedCategory = categoryMatch ? categoryMatch[1] : 'Bootcamp';
    const postCategoryText = categoryMatch ? categoryMatch[2] : desc;

    const thumbnailMatch = desc.match(/\(Thumbnail:\s*(.*?)\)/);
    const parsedThumbnail = thumbnailMatch ? thumbnailMatch[1] : '';

    let cleanDescription = postCategoryText;
    if (thumbnailMatch) {
      cleanDescription = postCategoryText.replace(/\(Thumbnail:\s*(.*?)\)/, '').trim();
    }

    setCategory((['Bootcamp', 'Gala Night', 'Boardroom', 'Masterclass'].includes(parsedCategory) ? parsedCategory : 'Bootcamp') as any);
    setDescriptionText(cleanDescription);
    setThumbnailUrl(parsedThumbnail);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setSaving(true);
    try {
      // Format the description field following: [Category] description_text (Thumbnail: thumbnail_url)
      let formattedDescription = `[${category}] ${descriptionText.trim()}`;
      if (type === 'video' && thumbnailUrl.trim()) {
        formattedDescription += ` (Thumbnail: ${thumbnailUrl.trim()})`;
      }

      const payload = {
        title: title.trim(),
        description: formattedDescription,
        url: url.trim(),
        type,
        featured,
      };

      if (editingId) {
        const res = await updateGalleryItemAction(editingId, payload);
        if (res.success && res.data) {
          updateGalleryItemState(editingId, res.data);
          setDialogOpen(false);
        } else {
          alert('Failed to update: ' + (res.error || 'Unknown error'));
        }
      } else {
        const res = await createGalleryItemAction(payload);
        if (res.success && res.data) {
          addGalleryItem(res.data);
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
    if (!confirm('Are you sure you want to delete this gallery memory?')) return;

    try {
      const res = await deleteGalleryItemAction(id);
      if (res.success) {
        removeGalleryItem(id);
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
        <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest leading-none">Loading Gallery Showcase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest mb-1">Interactive CMS</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Gallery Showcase</h1>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-[#d4af37] hover:bg-[#b08f24] text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> Add Media Item
        </button>
      </header>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#262626]">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Dynamic Showcase catalog ({galleryItems.length})</h3>
        </div>

        {galleryItems.length === 0 ? (
          <div className="p-12 text-center text-text-sub">
            <p className="text-sm font-bold uppercase tracking-wider mb-2">No active gallery items</p>
            <p className="text-xs text-[#525252]">Add photos, video streams, or YouTube embeds to show on the user-facing media page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {galleryItems.map((item) => {
              const desc = item.description || '';
              const categoryMatch = desc.match(/^\[(.*?)\] (.*)/);
              const displayCategory = categoryMatch ? categoryMatch[1] : 'Bootcamp';
              const isYoutube = item.url.includes('youtube') || item.url.includes('youtu.be');

              return (
                <div key={item.id} className="bg-[#050b14] border border-[#262626] rounded-2xl overflow-hidden shadow-md flex flex-col hover:border-[#d4af37]/40 transition-colors group">
                  <div className="h-44 overflow-hidden relative bg-black/40">
                    <img 
                      src={item.type === 'video' && item.description?.match(/\(Thumbnail:\s*(.*?)\)/)?.[1] ? item.description.match(/\(Thumbnail:\s*(.*?)\)/)?.[1] : item.url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {item.featured && (
                        <span className="p-1.5 bg-[#d4af37] text-black rounded-lg" title="Featured item">
                          <Star size={10} fill="currentColor" />
                        </span>
                      )}
                      <span className="px-2 py-1 bg-black/80 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-[#d4af37] rounded-lg">
                        {isYoutube ? 'YouTube' : item.type}
                      </span>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 bg-[#141414] text-white text-[8px] font-black uppercase tracking-widest border border-white/5 rounded-full">
                      {displayCategory}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-white text-sm font-bold tracking-tight line-clamp-1">{item.title}</h4>
                      <p className="text-[#a3a3a3] text-xs line-clamp-2 leading-relaxed h-[36px]">
                        {item.description ? item.description.replace(/^\[.*?\]/, '').replace(/\(Thumbnail:\s*(.*?)\)/, '').trim() : ''}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-[#262626]">
                      <span className="text-[10px] text-[#525252] font-mono">
                        {new Date(item.created_at || '').toLocaleDateString(undefined, { dateStyle: 'short' })}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 bg-[#111] hover:bg-[#222] text-[#A3A3A3] hover:text-white rounded-lg border border-[#262626] transition-colors"
                          title="Edit Media Item"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg border border-red-500/10 hover:border-red-500/20 transition-colors"
                          title="Delete Media Item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#050b14] border border-[#262626] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {editingId ? 'Edit Gallery Memory' : 'New Gallery Memory'}
              </h2>
              <button 
                onClick={() => setDialogOpen(false)}
                className="text-[#525252] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Memory Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Pitch Sessions in Accra"
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Media Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-white rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                  >
                    <option value="Bootcamp">Bootcamp</option>
                    <option value="Gala Night">Gala Night</option>
                    <option value="Boardroom">Boardroom</option>
                    <option value="Masterclass">Masterclass</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Base Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-white rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                  >
                    <option value="image">Image (Still Photographic)</option>
                    <option value="video">Video (Stream or Embed)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest block">Short Description</label>
                <textarea
                  required
                  rows={3}
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="Mentorship insights, founder activities, boardroom details..."
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all resize-none"
                />
              </div>

              <AdminMediaSelector
                label={type === 'image' ? 'Image File Source' : 'Video/Embed File Source'}
                value={url}
                onChange={setUrl}
                type={type}
              />

              {type === 'video' && (
                <div className="space-y-2 bg-[#0a0a0a] p-4 rounded-xl border border-[#262626] animate-in slide-in-from-top-4 duration-300">
                  <label className="text-xs font-black text-[#d4af37] uppercase tracking-widest">Video Thumbnail Image (Option)</label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="E.g. https://images.unsplash.com/photo-..."
                    className="w-full bg-[#050b14] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37]"
                  />
                  <span className="block text-[9px] text-text-sub">Provides a static placeholder image for continuous presentation prior to stream activation.</span>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-t border-[#262626] mt-4">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">Feature memory card</span>
                  <span className="block text-[10px] text-[#A3A3A3]">Featured media is showcased directly at the top levels of target user experiences.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatured(!featured)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 outline-none ${featured ? 'bg-[#d4af37]' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${featured ? 'translate-x-5 text-black' : 'translate-x-0'}`} />
                </button>
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
                  {editingId ? 'Modify Memory' : 'Incorporate Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
