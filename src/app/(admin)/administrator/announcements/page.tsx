'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, Edit2, Loader2, Save, X, Eye, EyeOff } from 'lucide-react';
import { AdminMediaSelector } from '@/components/AdminMediaSelector';
import { 
  getAnnouncementsAction, 
  createAnnouncementAction, 
  updateAnnouncementAction, 
  deleteAnnouncementAction 
} from '@/features/announcements/actions/announcements';
import { DatabaseAnnouncement as Announcement } from '@/types/database';

export default function AdminAnnouncementsPage() {
  const { 
    announcements, 
    setAnnouncements, 
    addAnnouncement, 
    removeAnnouncement, 
    updateAnnouncementState 
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await getAnnouncementsAction();
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, [setAnnouncements]);

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsPublished(true);
    setImageUrl('');
    setVideoUrl('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setIsPublished(ann.is_published);
    setImageUrl(ann.image_url || '');
    setVideoUrl(ann.video_url || '');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        is_published: isPublished,
      };

      if (editingId) {
        const res = await updateAnnouncementAction(editingId, payload);
        if (res.success && res.data) {
          updateAnnouncementState(editingId, res.data);
          setDialogOpen(false);
        } else {
          alert('Failed to update: ' + (res.error || 'Unknown error'));
        }
      } else {
        const res = await createAnnouncementAction(payload);
        if (res.success && res.data) {
          addAnnouncement(res.data);
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
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const res = await deleteAnnouncementAction(id);
      if (res.success) {
        removeAnnouncement(id);
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
        <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest leading-none">Loading Announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest mb-1">Interactive CMS</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Announcements Board</h1>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-[#d4af37] hover:bg-[#b08f24] text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> Create Announcement
        </button>
      </header>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#262626]">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Dynamic Alerts ({announcements.length})</h3>
        </div>

        {announcements.length === 0 ? (
          <div className="p-12 text-center text-text-sub">
            <p className="text-sm font-bold uppercase tracking-wider mb-2">No active announcements</p>
            <p className="text-xs text-[#525252]">Add an announcement dynamically to show on the user-facing home page.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-6 hover:bg-white/[0.01] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  {ann.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#262626] shrink-0 bg-[#141414]">
                      <img src={ann.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${ann.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                        {ann.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-[10px] text-text-sub font-mono">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-white text-base font-bold tracking-tight">{ann.title}</h4>
                    <p className="text-xs text-text-sub line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleOpenEdit(ann)}
                    className="p-3 bg-[#111] hover:bg-[#222] text-[#A3A3A3] hover:text-white rounded-xl border border-[#262626] transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-3 bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl border border-red-500/10 hover:border-red-500/20 transition-colors"
                    title="Delete Announcement"
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
          <div className="bg-[#050b14] border border-[#262626] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {editingId ? 'Edit Announcement' : 'New Announcement'}
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
                <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Launching Season physical hubs details"
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest">Body Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter details about your announcement..."
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminMediaSelector
                  label="Display Cover Image"
                  value={imageUrl}
                  onChange={setImageUrl}
                  type="image"
                />

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#A3A3A3] uppercase tracking-widest block">Video Pitch Embed URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="E.g. youtube.com/watch?v=..."
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-[14px] text-sm text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] transition-all"
                  />
                  <span className="block text-[10px] text-text-sub">YouTube embed link or direct video reference URL for streaming pitch overlays.</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-[#262626] mt-4">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">Publish Directly</span>
                  <span className="block text-[10px] text-[#A3A3A3]">Active status immediately displays announcement card on home metrics grids.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 outline-none ${isPublished ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
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
                  {editingId ? 'Modify Alert' : 'Post Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
