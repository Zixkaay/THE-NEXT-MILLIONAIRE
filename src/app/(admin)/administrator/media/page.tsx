'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Database, 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  PlayCircle 
} from 'lucide-react';
import { 
  getMediaLibraryAction, 
  addMediaLibraryAction, 
  deleteMediaLibraryAction 
} from '@/features/media/actions';
import { uploadToCloudinary } from '@/services/cloudinary/upload';
import { DatabaseMediaLibrary } from '@/types/database';

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<DatabaseMediaLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'library' | 'device' | 'url'>('library');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Feedback states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [destoyingId, setDestroyingId] = useState<string | null>(null);

  // External URL inputs
  const [urlName, setUrlName] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load items on mount and after operations
  const loadMedia = async () => {
    try {
      setLoading(true);
      const items = await getMediaLibraryAction();
      setMediaItems(items);
    } catch (err: any) {
      console.error('[AdminMediaPage] Failed to fetch media items:', err);
      setErrorMsg('Could not fetch active media registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Clipboard write fallback active:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Supported formats check: images (jpg/png/webp), video (mp4)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validVideoTypes = ['video/mp4'];
    const isValidImage = validImageTypes.includes(file.type);
    const isValidVideo = validVideoTypes.includes(file.type);

    if (!isValidImage && !isValidVideo) {
      setErrorMsg('Unsupported format. Please select deep JPG, PNG, WEBP images, or MP4 videos.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // 1. Client-direct signed upload
      const uploadResult = await uploadToCloudinary(file, (percent) => {
        setUploadProgress(percent);
      });

      // 2. Save metadata index in Supabase
      const response = await addMediaLibraryAction({
        name: file.name,
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        type: isValidVideo ? 'video' : 'image',
        source: 'device',
        size_bytes: uploadResult.bytes || file.size
      });

      if (response.success) {
        setSuccessMsg(`"${file.name}" uploaded and cataloged in the media hub!`);
        await loadMedia();
        // Clear value
        if (fileInputRef.current) fileInputRef.current.value = '';
        // Switch back to library view
        setTimeout(() => {
          setActiveTab('library');
          setSuccessMsg(null);
        }, 1500);
      } else {
        setErrorMsg(response.message);
      }
    } catch (error: any) {
      console.error('[AdminMediaPage] Upload failed:', error);
      setErrorMsg(error.message || 'Error occurred during media synchronization.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLinkUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!urlName.trim() || !urlLink.trim()) {
      setErrorMsg('Please specify both a Reference Name and a valid URL.');
      return;
    }

    try {
      const response = await addMediaLibraryAction({
        name: urlName.trim(),
        url: urlLink.trim(),
        type: urlType,
        source: 'external',
        size_bytes: 0
      });

      if (response.success) {
        setSuccessMsg(`External asset "${urlName}" linked successfully!`);
        setUrlName('');
        setUrlLink('');
        await loadMedia();
        setTimeout(() => {
          setActiveTab('library');
          setSuccessMsg(null);
        }, 1500);
      } else {
        setErrorMsg(response.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to establish connection to registry servers.');
    }
  };

  const handleDestroyAsset = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete "${name}" from the media registry?`)) {
      return;
    }

    setDestroyingId(id);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const response = await deleteMediaLibraryAction(id);
      if (response.success) {
        setSuccessMsg(`Asset "${name}" successfully deleted.`);
        await loadMedia();
      } else {
        setErrorMsg(response.message);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Asset deletion encountered an administrative failure.');
    } finally {
      setDestroyingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return 'External Reference';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const tabClass = (tab: string) => `flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest border-b-2 transition-all duration-300 ${activeTab === tab ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-[#A3A3A3] hover:text-white'}`;

  return (
    <div className="space-y-6">
      {/* Upper header segment */}
      <div className="flex justify-between items-center mb-6">
         <div>
           <h1 className="text-2xl font-black text-white uppercase tracking-wider font-sans">The Media Library</h1>
           <p className="text-[#A3A3A3] text-xs mt-1 leading-snug">Centralized control center for Cloudinary multimedia and linked resources</p>
         </div>
      </div>

      {/* Dynamic Feedback Prompts */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold font-mono flex items-center gap-3 animate-in fade-in duration-200">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold font-mono flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main interactive media grid/uploaders container */}
      <div className="bg-[#0c121e] border border-[#232B3A]/40 rounded-2xl overflow-hidden shadow-2xl">
        {/* Upper Selection Tabs */}
        <div className="flex border-b border-[#232B3A]/40 overflow-x-auto bg-[#0a0f19]">
          <button onClick={() => { setActiveTab('library'); setSuccessMsg(null); setErrorMsg(null); }} className={tabClass('library')}>
            <Database size={14} className="stroke-[2.5]" /> Internal Library
          </button>
          <button onClick={() => { setActiveTab('device'); setSuccessMsg(null); setErrorMsg(null); }} className={tabClass('device')}>
            <UploadCloud size={14} className="stroke-[2.5]" /> Device Upload
          </button>
          <button onClick={() => { setActiveTab('url'); setSuccessMsg(null); setErrorMsg(null); }} className={tabClass('url')}>
            <LinkIcon size={14} className="stroke-[2.5]" /> External URL
          </button>
        </div>

        {/* Content Tabs render blocks */}
        <div className="p-6 md:p-8 min-h-[350px]">
          {/* Active Tab: Library Manager */}
          {activeTab === 'library' && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 size={36} className="text-[#d4af37] animate-spin" />
                  <p className="text-xs text-[#A3A3A3] uppercase tracking-widest font-mono">Loading Registered Assets...</p>
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-[#172132] rounded-full flex items-center justify-center mb-4">
                    <Database size={24} className="text-[#64748B]" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1 leading-none uppercase tracking-wider">No Media Configured</h3>
                  <p className="text-[#A3A3A3] text-xs max-w-sm">Bring your database to life by uploading device assets or linking external links.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mediaItems.map((media) => (
                    <div 
                      key={media.id} 
                      className="bg-[#070b12] border border-[#1d2736]/60 rounded-xl overflow-hidden flex flex-col group hover:border-[#d4af37]/60 transition-all duration-300"
                    >
                      {/* Media Card Preview Section */}
                      <div className="h-44 relative bg-[#04060a] flex items-center justify-center overflow-hidden border-b border-[#1d2736]/40">
                        {media.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#A3A3A3] p-4 relative">
                            {/* Check if it is an external URL e.g. youtube/vimeo, can show play accent */}
                            <PlayCircle size={44} className="text-[#d4af37] group-hover:scale-110 transition-transform duration-300 z-10" />
                            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8b9bb4] mt-2 font-bold bg-[#172132]/60 px-2 py-0.5 rounded">Video Asset</span>
                            {media.source === 'external' ? (
                              <div className="absolute inset-0 bg-[#070b12]/30 flex items-end justify-center pb-2">
                                <span className="text-[9px] font-sans text-[#A3A3A3] font-bold bg-[#172132]/60 px-1.5 py-0.5 rounded tracking-wider uppercase">Linked Link</span>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <img 
                            src={media.url} 
                            alt={media.name} 
                            onError={(e) => {
                              // Fallback for broken/restricted files
                              e.currentTarget.src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        )}
                        {/* Source Tag Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`text-[9px] font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded-md ${
                            media.source === 'device' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : media.source === 'external'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-[#1d2736] text-[#A3A3A3]'
                          }`}>
                            {media.source}
                          </span>
                        </div>
                      </div>

                      {/* Info & Administration controls block */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="min-w-0">
                          <h4 className="text-white font-bold text-sm truncate uppercase tracking-wide" title={media.name}>
                            {media.name}
                          </h4>
                          <p className="text-[#A3A3A3] text-[10px] font-mono leading-none uppercase tracking-wider mt-1.5">
                            {formatBytes(media.size_bytes)}
                          </p>
                        </div>

                        {/* Interactive utilities buttons row */}
                        <div className="pt-2 border-t border-[#1d2736]/40 flex items-center justify-between gap-2">
                          <button 
                            onClick={() => handleCopyUrl(media.id, media.url)}
                            className="flex items-center gap-1 text-xs text-[#A3A3A3] hover:text-[#d4af37] transition-colors font-mono uppercase bg-[#141b26]/50 border border-[#232B3A]/40 px-2.5 py-1.5 rounded-lg text-left"
                            title="Copy media asset URL link"
                          >
                            {copiedId === media.id ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy URL</span>
                              </>
                            )}
                          </button>

                          <button 
                            disabled={destoyingId === media.id}
                            onClick={() => handleDestroyAsset(media.id, media.name)}
                            className="p-1.5 text-xs text-[#dc2626] hover:bg-red-500/10 rounded-lg transition-colors border border-transparent disabled:opacity-40"
                            title="Format/Remove asset"
                          >
                            {destoyingId === media.id ? (
                              <Loader2 size={14} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Device Direct Upload */}
          {activeTab === 'device' && (
            <div className="max-w-xl mx-auto py-8">
              <div 
                className={`flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-2xl bg-[#070b12] hover:bg-[#0c121e]/50 cursor-pointer group transition-all duration-300 ${
                  uploading 
                    ? 'border-[#d4af37] pointer-events-none' 
                    : 'border-[#232B3A]/60 hover:border-[#d4af37]/60'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/mp4" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all duration-300 ${
                  uploading 
                    ? 'bg-[#d4af37]' 
                    : 'bg-[#172132] group-hover:bg-[#d4af37]'
                }`}>
                  <UploadCloud 
                    size={28} 
                    className={`transition-colors duration-300 ${
                      uploading 
                        ? 'text-black animate-bounce' 
                        : 'text-[#8b9bb4] group-hover:text-black'
                    }`} 
                  />
                </div>

                <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-wide">
                  {uploading ? `Uploading to Cloudinary... ${uploadProgress}%` : 'Upload local assets'}
                </h3>
                <p className="text-[#A3A3A3] text-xs text-center max-w-sm mb-6 leading-relaxed">
                  Direct client-signed integration. Supported formats: JPG, PNG, WEBP, and MP4. Maximum size 32MB.
                </p>

                {uploading ? (
                  <div className="w-full max-w-xs bg-[#172132] h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-[#d4af37] h-full rounded-full transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : (
                  <button 
                    type="button"
                    className="border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                  >
                    Select Local File
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active Tab: External URLs Link */}
          {activeTab === 'url' && (
            <div className="max-w-xl mx-auto py-6">
              <div className="bg-[#070b12] border border-[#1d2736]/40 p-6 rounded-2xl">
                <h3 className="text-white font-bold text-md mb-4 flex items-center gap-2 uppercase tracking-wider font-sans">
                  <LinkIcon className="text-[#d4af37]" size={16} /> Incorporate Remote URL
                </h3>
                
                <form onSubmit={handleLinkUrlSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-1.5">Asset Custom Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. YouTube Audition Audits" 
                      value={urlName}
                      onChange={(e) => setUrlName(e.target.value)}
                      className="w-full bg-[#111823] border border-[#232B3A]/60 rounded-xl px-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none transition-colors font-sans" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-1.5">Resource Link (HTTP/S)</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://youtu.be/..." 
                      value={urlLink}
                      onChange={(e) => setUrlLink(e.target.value)}
                      className="w-full bg-[#111823] border border-[#232B3A]/60 rounded-xl px-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none transition-colors font-sans" 
                    />
                  </div>

                  {/* Resource categorization types toggle */}
                  <div>
                    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-2">Resource Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUrlType('image')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                          urlType === 'image' 
                            ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]' 
                            : 'bg-transparent text-[#A3A3A3] border-[#232B3A]/65 hover:border-white/20'
                        }`}
                      >
                        <ImageIcon size={14} /> Image Asset
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrlType('video')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                          urlType === 'video' 
                            ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]' 
                            : 'bg-transparent text-[#A3A3A3] border-[#232B3A]/65 hover:border-white/20'
                        }`}
                      >
                        <Video size={14} /> Video Asset
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button 
                      type="submit"
                      className="bg-[#d4af37] text-black px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors w-full cursor-pointer"
                    >
                      Establish Link Reference
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
