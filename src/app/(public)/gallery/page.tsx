'use client';

import React, { useState } from 'react';
import { Play, Image as ImageIcon, Video as VideoIcon, Tv, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface GalleryItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'youtube';
  url: string; 
  thumbnail_url?: string;
  category: 'Bootcamp' | 'Gala Night' | 'Boardroom' | 'Masterclass';
  description: string;
  date: string;
}

export default function GalleryPage() {
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const dbGalleryItems = useAppStore((state) => state.galleryItems);

  const mappedGalleryItems: GalleryItem[] = dbGalleryItems.map((item) => {
    // Parse category from description (e.g. "[Bootcamp] our description text")
    const descriptionText = item.description || '';
    const categoryMatch = descriptionText.match(/^\[(.*?)\] (.*)/);
    const categoryName = categoryMatch ? categoryMatch[1] : 'Bootcamp';
    const displayDescription = categoryMatch ? categoryMatch[2] : descriptionText;

    // Check if there is a Thumbnail injected inside description in brackets like "(Thumbnail: url)"
    const thumbnailMatch = descriptionText.match(/\(Thumbnail:\s*(.*?)\)/);
    const thumbnail_url = thumbnailMatch ? thumbnailMatch[1] : undefined;

    // Is it a youtube URL? Let's check:
    const isYoutube = item.url.includes('youtube.com') || item.url.includes('youtu.be') || item.url.includes('/embed/');
    const type = isYoutube ? 'youtube' : item.type;

    // Remove the trailing thumbnail text from description if matched
    let cleanDescription = displayDescription;
    if (thumbnailMatch) {
      cleanDescription = displayDescription.replace(/\(Thumbnail:\s*(.*?)\)/, '').trim();
    }

    return {
      id: item.id,
      title: item.title,
      type: type as 'image' | 'video' | 'youtube',
      url: item.url,
      thumbnail_url: thumbnail_url,
      category: categoryName as any,
      description: cleanDescription,
      date: new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })
    };
  });

  const filteredItems = mappedGalleryItems.filter((item) => {
    const matchesMedia =
      mediaFilter === 'all' ||
      (mediaFilter === 'photos' && item.type === 'image') ||
      (mediaFilter === 'videos' && (item.type === 'video' || item.type === 'youtube'));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesMedia && matchesCategory;
  });

  const categories = ['all', 'Bootcamp', 'Gala Night', 'Boardroom', 'Masterclass'];


  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev! + 1));
  };

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="bg-[#0A0E17] text-white min-h-screen pt-36 pb-24 font-sans select-none overflow-x-hidden animate-in fade-in duration-500">
      
      {/* Decorative Golden Background Glows */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#d4af37]/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-[#a67c00]/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Cinematic Header Block */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] font-mono text-xs uppercase tracking-[0.25em] font-semibold mb-3">
            EXPLORE THE EXPERIENCE
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5 leading-none">
            MEDIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#A67C00]">SHOWCASE</span>
          </h1>
          <div className="w-16 h-[2px] bg-gradient-to-r from-[#D4AF37] to-transparent mx-auto mb-6"></div>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Step behind the camera to witness the ideas, intensity, and unforgettable milestones of Africa’s rising entrepreneurial icons.
          </p>
        </div>

        {/* Premium Tab Bar Grid */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border border-[#232B3A]/80 bg-[#101622]/80 backdrop-blur p-4 rounded-3xl mb-12 shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
          
          {/* Photos vs. Videos Selector */}
          <div className="flex bg-[#0A0E17] border border-[#232B3A]/40 p-1.5 rounded-2xl w-full md:w-auto">
            {[
              { label: 'All Media', id: 'all' },
              { label: 'Photos', id: 'photos' },
              { label: 'Videos & Audios', id: 'videos' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMediaFilter(tab.id as any);
                  setLightboxIndex(null);
                }}
                className={`flex-1 md:flex-initial text-center px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  mediaFilter === tab.id
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-black shadow-[0_4px_15px_rgba(212,175,55,0.25)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Core Episodes & Activities Dropdown Filter */}
          <div className="flex items-center gap-2.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setLightboxIndex(null);
                }}
                className={`shrink-0 px-4 py-2 border rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                    : 'border-[#232B3A]/80 text-gray-400 hover:text-white hover:border-[#D4AF37]/45'
                }`}
              >
                {cat === 'all' ? 'All Segments' : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Media Grid Cards */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => {
              const previewSrc = item.thumbnail_url || item.url;
              return (
                <div
                  key={item.id}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative bg-[#101622] border border-[#1C2433] rounded-2xl overflow-hidden cursor-pointer hover:border-[#D4AF37]/80 hover:shadow-[0_10px_35px_rgba(212,175,55,0.1)] transition-all duration-500 flex flex-col h-full"
                >
                  
                  {/* Absolute Badge Category */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="bg-black/85 border border-[#232B3A]/80 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Absolute Badge Type Indicator */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="w-8 h-8 rounded-full bg-black/85 border border-[#232B3A]/80 flex items-center justify-center text-white shadow-md">
                      {item.type === 'image' && <ImageIcon size={13} className="text-gray-300" />}
                      {(item.type === 'video' || item.type === 'youtube') && <Play size={13} className="text-[#D4AF37] fill-[#D4AF37] ml-0.5" />}
                    </span>
                  </div>

                  {/* Aesthetic Visual Stage (Thumbnail) */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0E17] group-hover:shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                    <img
                      src={previewSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Hover Dimming & Play/Maximize Button Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-black shadow-xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-500">
                        {item.type === 'image' ? (
                          <Maximize2 size={20} className="font-bold stroke-[3px]" />
                        ) : (
                          <Play size={20} className="fill-black ml-1 text-black font-bold stroke-[3px]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detail Info Plate */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#A67C00] font-bold font-mono uppercase tracking-widest block mb-1">
                        {item.date}
                      </span>
                      <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-2 line-clamp-1 group-hover:text-[#D4AF37] transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 font-light">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#1C2433] flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        {item.type === 'image' ? 'Photograph Asset' : 'Broadcast Media'}
                      </span>
                      <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider group-hover:underline">
                        Launch View &rarr;
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-[#1E2533] rounded-3xl p-16 text-center bg-[#101622] shadow-2xl relative">
            <X size={36} className="text-[#D4AF37]/80 mx-auto mb-4" />
            <h2 className="text-white text-lg font-bold uppercase tracking-wider mb-2">No Content Available</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto font-light">
              We look forward to updating our showcase soon with fresh files matching the selected segment and activity filters.
            </p>
          </div>
        )}

      </div>

      {/* FULLSTAGE IMMERSIVE LIGHTBOX */}
      {activeLightboxItem && (
        <div
          className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-300 pointer-events-auto"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox Navigation Header */}
          <div className="p-6 flex items-center justify-between border-b border-[#1C2433] bg-black/40 backdrop-blur">
            <div className="flex flex-col">
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-black mb-0.5">
                {activeLightboxItem.category} &bull; SHOWCASE
              </span>
              <h2 className="text-white text-base md:text-xl font-bold uppercase truncate max-w-xs md:max-w-2xl">
                {activeLightboxItem.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-5">
              <span className="text-xs text-gray-400 font-mono font-bold">
                {lightboxIndex! + 1} / {filteredItems.length}
              </span>
              <button
                className="bg-[#1C2433] hover:bg-red-600/20 text-white hover:text-red-500 p-2.5 rounded-full border border-[#232B3A] hover:border-red-500/50 transition-all cursor-pointer"
                onClick={() => setLightboxIndex(null)}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Media Playback View Frame */}
          <div 
            className="flex-1 flex items-center justify-between px-4 sm:px-12 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Controller Button */}
            <button
              onClick={handlePrev}
              className="absolute left-6 md:left-12 z-50 bg-[#101622]/90 p-3.5 rounded-full text-gray-400 hover:text-[#D4AF37] border border-[#1C2433] hover:border-[#D4AF37]/50 transition-all"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Stage Body */}
            <div className="w-full max-w-4xl mx-auto h-[50vh] md:h-[62vh] flex items-center justify-center p-2 relative">
              {activeLightboxItem.type === 'image' && (
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.title}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-[#1C2433] animate-in zoom-in duration-300"
                />
              )}

              {activeLightboxItem.type === 'video' && (
                <video
                  src={activeLightboxItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-[#1C2433]"
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {activeLightboxItem.type === 'youtube' && (
                <div className="w-full h-full max-w-[854px] aspect-video flex items-center justify-center rounded-2xl overflow-hidden bg-black shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-[#1C2433]">
                  <iframe
                    src={activeLightboxItem.url}
                    title={activeLightboxItem.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Next Controller Button */}
            <button
              onClick={handleNext}
              className="absolute right-6 md:right-12 z-50 bg-[#101622]/90 p-3.5 rounded-full text-gray-400 hover:text-[#D4AF37] border border-[#1C2433] hover:border-[#D4AF37]/50 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Immersive Captions Tray */}
          <div 
            className="p-8 bg-black/80 border-t border-[#1C2433] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="max-w-3xl mx-auto text-xs sm:text-sm text-gray-300 leading-relaxed font-sans font-light">
              {activeLightboxItem.description}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
