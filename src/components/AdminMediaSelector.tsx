'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Folder, Link as LinkIcon, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getMediaLibraryAction } from '@/features/media/actions';
import { uploadToCloudinary } from '@/services/cloudinary/upload';
import { DatabaseMediaLibrary } from '@/types/database';

interface AdminMediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  type?: 'image' | 'video';
}

export function AdminMediaSelector({
  value,
  onChange,
  label = 'Media Asset',
  type = 'image'
}: AdminMediaSelectorProps) {
  const [activeTab, setActiveTab] = useState<'device' | 'library' | 'url'>('url');
  const [libraryItems, setLibraryItems] = useState<DatabaseMediaLibrary[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load library items when library tab is accessed
  useEffect(() => {
    if (activeTab === 'library') {
      const loadLibrary = async () => {
        setLoadingLibrary(true);
        setErrorMsg(null);
        try {
          const items = await getMediaLibraryAction();
          // Filter by type if provided
          const filtered = items.filter(item => item.type === type);
          setLibraryItems(filtered);
        } catch (err: any) {
          console.error('[AdminMediaSelector] Failed to load library:', err);
          setErrorMsg('Failed to load internal media library.');
        } finally {
          setLoadingLibrary(false);
        }
      };
      loadLibrary();
    }
  }, [activeTab, type]);

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, (percent) => {
        setUploadProgress(percent);
      });
      if (result && result.url) {
        // Log the upload in the Media Library registry for reuse across the platform
        const { addMediaLibraryAction } = await import('@/features/media/actions');
        await addMediaLibraryAction({
          name: file.name,
          url: result.url,
          public_id: result.public_id,
          type: type,
          source: 'device',
          size_bytes: result.bytes || file.size
        });
        
        onChange(result.url);
      } else {
        setErrorMsg('Upload completed but returned no valid secure URL.');
      }
    } catch (err: any) {
      console.error('[AdminMediaSelector] Upload failure:', err);
      setErrorMsg(err?.message || 'Error uploading file to Cloudinary.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-3 border border-white/10 rounded-2xl p-4 bg-white/[0.02]">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-black text-[#d4af37] uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[10px] text-white/40 block">Select active method</span>
      </div>

      {/* Tabs selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab('device')}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'device'
              ? 'bg-[#d4af37] text-black shadow-lg'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Upload size={12} />
          Device
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'library'
              ? 'bg-[#d4af37] text-black shadow-lg'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Folder size={12} />
          Library
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'url'
              ? 'bg-[#d4af37] text-black shadow-lg'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <LinkIcon size={12} />
          URL
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Method forms */}
      <div className="pt-1.5">
        {/* Method 1: Device Upload */}
        {activeTab === 'device' && (
          <div className="space-y-3">
            {uploading ? (
              <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/10">
                <Loader2 size={24} className="animate-spin text-[#d4af37] mb-2" />
                <span className="text-xs text-white/80 font-medium">Uploading to cloud: {uploadProgress}%</span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#d4af37] h-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-5 hover:border-[#d4af37]/40 cursor-pointer transition-all bg-black/20">
                <Upload size={20} className="text-white/40 mb-1.5" />
                <span className="text-xs text-white/80 font-bold">Upload file from your computer</span>
                <span className="text-[10px] text-white/40 mt-1">Supports JPG, PNG, WEBP, MP4</span>
                <input
                  type="file"
                  accept={type === 'video' ? 'video/mp4' : 'image/*'}
                  onChange={handleDeviceUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Method 2: Selecting existing library media */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            {loadingLibrary ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 size={16} className="animate-spin text-[#d4af37]" />
                <span className="text-xs text-white/50">Loading cataloged media...</span>
              </div>
            ) : libraryItems.length === 0 ? (
              <div className="text-center py-5 border border-white/5 bg-black/10 rounded-xl">
                <ImageIcon size={20} className="mx-auto text-white/20 mb-1" />
                <span className="text-xs text-white/40 block">No archived {type} assets found.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {libraryItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onChange(item.url)}
                    className={`text-left rounded-xl p-1.5 border transition-all flex items-center gap-2 relative group overflow-hidden ${
                      value === item.url
                        ? 'border-[#d4af37] bg-[#d4af37]/5'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    }`}
                  >
                    {type === 'image' ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/50">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                        <ImageIcon size={14} className="text-[#d4af37]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white truncate leading-tight">{item.name}</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">{item.source}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Method 3: Direct external URL input */}
        {activeTab === 'url' && (
          <div className="space-y-1">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/asset.jpg"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#d4af37] transition-all"
            />
            <span className="text-[9px] text-white/30 italic block px-1">Ensure the third-party provider allows hotlinking.</span>
          </div>
        )}
      </div>

      {/* Selected media preview */}
      {value.trim() && (
        <div className="mt-3.5 border border-white/5 bg-black/30 rounded-xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 min-w-0">
            {type === 'image' ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black shrink-0">
                <img src={value} alt="Selected preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg border border-white/10 bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                <ImageIcon size={18} className="text-[#d4af37]" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Currently Selected</span>
              <span className="text-[9px] text-white/60 block truncate font-mono mt-0.5">{value}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest block px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
