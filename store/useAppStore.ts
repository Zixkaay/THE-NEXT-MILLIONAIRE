import { create } from 'zustand';
import { DatabaseParticipant, DatabaseBlogPost as BlogPost, DatabaseSettings as GlobalSettings, ParticipantStatus, RankingTier, DatabaseAnnouncement as Announcement, DatabaseGalleryItem as GalleryItem } from '@/types/database';
import { INITIAL_PARTICIPANTS } from '@/data/staticContent';

export interface MediaLibraryItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
}

interface AppSettings extends GlobalSettings {
  countdown_target: string;
  prize_pool_ghc: string;
  about_mission?: string;
  about_vision?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_type: 'text' | 'image' | 'icon';
  logo_content: string; // text, url, or exact icon string representation
}

interface AppState {
  settings: AppSettings;
  sponsors: Sponsor[];
  participants: DatabaseParticipant[];
  blogPosts: BlogPost[];
  announcements: Announcement[];
  galleryItems: GalleryItem[];
  mediaLibrary: MediaLibraryItem[];
  addVote: (participantId: string, amount: number) => void;
  syncParticipants: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateParticipantStatus: (id: string, status: string) => void;
  updateParticipantRanking: (id: string, ranking: number | null) => void;
  removeParticipant: (id: string) => void;
  addSponsor: (sponsor: Sponsor) => void;
  removeSponsor: (id: string) => void;
  removeBlogPost: (id: string) => void;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => void;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'created_at'> | BlogPost) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  addAnnouncement: (announcement: Announcement) => void;
  removeAnnouncement: (id: string) => void;
  updateAnnouncementState: (id: string, updates: Partial<Announcement>) => void;
  setGalleryItems: (items: GalleryItem[]) => void;
  addGalleryItem: (item: GalleryItem) => void;
  removeGalleryItem: (id: string) => void;
  updateGalleryItemState: (id: string, updates: Partial<GalleryItem>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    id: 'global',
    registration_open: true,
    voting_enabled: false,
    video_upload_visible: true,
    video_required: false,
    vote_price: 1.00,
    featured_blog_posts: ['b1', 'b2'],
    featured_gallery_items: ['p1', 'p2', 'p3', 'p4'],
    countdown_target: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool_ghc: '1,000,000+',
    about_mission: 'The Next Billionaire Path is dedicated to discovering, funding, and scaling the most brilliant young minds emerging from Africa.',
    about_vision: 'To create a self-sustaining ecosystem of wealth creation where the youth are empowered by the community.',
    updated_at: new Date().toISOString()
  },

  sponsors: [
    { id: 's1', name: 'Logic Games', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1782926764/SPONSOR_LOGIC_GAMES_tgm22x.jpg' },
    { id: 's2', name: 'WCED ENTERTAINMENT', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1782926762/COMPANY_LOGO_ljuw9b.jpg' },
    { id: 's3', name: 'Buronic Trophy', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776865295/BuronicTROPHY_fbmby1.png' },
    { id: 's4', name: "BILLIONAIR'S PATH", logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png' }
  ],
  
  participants: INITIAL_PARTICIPANTS as DatabaseParticipant[],
  
  blogPosts: [],
  announcements: [],
  galleryItems: [],
  mediaLibrary: [],

  addVote: (participantId, amount) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === participantId ? { ...p, vote_count: p.vote_count + amount } : p
    )
  })),

  syncParticipants: async () => {
    // Basic sync, in a real app this would fetch from Supabase
    set({ participants: INITIAL_PARTICIPANTS as DatabaseParticipant[] });
  },

  addSponsor: (sponsor) => set((state) => ({
    sponsors: [...state.sponsors, sponsor]
  })),

  removeSponsor: (id) => set((state) => ({
    sponsors: state.sponsors.filter(s => s.id !== id)
  })),

  removeParticipant: (id) => set((state) => ({
    participants: state.participants.filter(p => p.id !== id)
  })),

  removeBlogPost: (id) => set((state) => ({
    blogPosts: state.blogPosts.filter(p => p.id !== id)
  })),

  updateBlogPost: (id, updates) => set((state) => ({
    blogPosts: state.blogPosts.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  addBlogPost: (post) => set((state) => ({
    blogPosts: [post as BlogPost, ...state.blogPosts]
  })),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  }), false),

  updateParticipantStatus: (id, status) => set((state) => ({
    participants: state.participants.map(p =>
      p.id === id ? { ...p, status: status as ParticipantStatus } : p
    )
  })),

  updateParticipantRanking: (id, ranking) => set((state) => {
    const newParticipants = state.participants.map(p => {
      if (ranking !== null && p.ranking === ranking && p.id !== id) {
        return { ...p, ranking: null };
      }
      if (p.id === id) {
        return { ...p, ranking: ranking as RankingTier | null };
      }
      return p;
    });
    return { participants: newParticipants };
  }),

  setAnnouncements: (announcements) => set({ announcements }),
  addAnnouncement: (announcement) => set((state) => ({
    announcements: [announcement, ...state.announcements]
  })),
  removeAnnouncement: (id) => set((state) => ({
    announcements: state.announcements.filter(a => a.id !== id)
  })),
  updateAnnouncementState: (id, updates) => set((state) => ({
    announcements: state.announcements.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  setGalleryItems: (galleryItems) => set({ galleryItems }),
  addGalleryItem: (item) => set((state) => ({
    galleryItems: [item, ...state.galleryItems]
  })),
  removeGalleryItem: (id) => set((state) => ({
    galleryItems: state.galleryItems.filter(i => i.id !== id)
  })),
  updateGalleryItemState: (id, updates) => set((state) => ({
    galleryItems: state.galleryItems.map(i => i.id === id ? { ...i, ...updates } : i)
  })),
}));
