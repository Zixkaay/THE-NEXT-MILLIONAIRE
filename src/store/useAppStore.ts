import { create } from 'zustand';
import { DatabaseParticipant, DatabaseBlogPost as BlogPost, DatabaseSettings as GlobalSettings, DatabaseAnnouncement as Announcement, DatabaseGalleryItem, ParticipantStatus, RankingTier } from '@/types/database';
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
  mediaLibrary: MediaLibraryItem[];
  announcements: Announcement[];
  galleryItems: DatabaseGalleryItem[];
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
  setSponsors: (sponsors: Sponsor[]) => void;
  setBlogPosts: (posts: BlogPost[]) => void;
  setParticipants: (participants: DatabaseParticipant[]) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  addAnnouncement: (announcement: Announcement) => void;
  removeAnnouncement: (id: string) => void;
  updateAnnouncementState: (id: string, updates: Partial<Announcement>) => void;
  setGalleryItems: (items: DatabaseGalleryItem[]) => void;
  addGalleryItem: (item: DatabaseGalleryItem) => void;
  removeGalleryItem: (id: string) => void;
  updateGalleryItemState: (id: string, updates: Partial<DatabaseGalleryItem>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    id: 'global',
    registration_open: true,
    voting_enabled: false,
    video_upload_visible: true,
    video_required: false,
    vote_price: 5,
    registration_fee: 0,
    featured_blog_posts: ['b1', 'b2'],
    featured_gallery_items: ['p1', 'p2', 'p3', 'p4'],
    countdown_target: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    countdown_active: true,
    countdown_event_name: 'AUDITION DAY',
    site_logo_url: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png',
    site_background_url: '',
    prize_pool_ghc: '1,000,000+',
    about_mission: 'The Next Billionaire Path is dedicated to discovering, funding, and scaling the most brilliant young minds emerging from Africa. We do not just look for businesses; we seek systemic disruptors capable of reshaping industries and contributing to a newly defined global economy.',
    about_vision: 'To create a self-sustaining ecosystem of wealth creation where the youth are empowered by the community. By utilizing transparent, crowd-supported voting and elite mentorship, we are charting a direct, uncorrupted path to the billionaires of tomorrow.',
    remove_registration_form: false,
    advertising_title: 'Global Pitch Competition',
    advertising_image_url: 'https://images.unsplash.com/photo-1520095972714-909e91b05322?q=80&w=2000&auto=format&fit=crop',
    advertising_link_url: '/about',
    advertising_text: 'Sponsor a contestant or join with our high-net-worth mentors to accelerate the next business titan. Premium spectator path is now open.',
    updated_at: new Date().toISOString()
  },

  sponsors: [
    { id: 's1', name: 'Logic Games', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1782926764/SPONSOR_LOGIC_GAMES_tgm22x.jpg' },
    { id: 's2', name: 'WCED ENTERTAINMENT', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1782926762/COMPANY_LOGO_ljuw9b.jpg' },
    { id: 's3', name: 'Buronic Trophy', logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776865295/BuronicTROPHY_fbmby1.png' },
    { id: 's4', name: "BILLIONAIR'S PATH", logo_type: 'image', logo_content: 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png' }
  ],
  
  participants: [
    {
      id: 'p1', full_name: 'Kwame Osei', nickname: 'TechKwame', status: 'qualified' as ParticipantStatus, ranking: 1, vote_count: 54320, media_urls: { images: ['https://images.unsplash.com/photo-1543807535-ecefc092c2da?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Pioneering AI-driven logistics for rural farmers in Ghana. Visionary leader aiming to digitize the agricultural supply chain from farm to market.', metadata: { Industry: 'AgriTech', Experience: '5 Years', Location: 'Accra, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'p2', full_name: 'Ama Mensah', nickname: 'AmaInnovates', status: 'qualified' as ParticipantStatus, ranking: 2, vote_count: 42100, media_urls: { images: ['https://images.unsplash.com/photo-1531123897727-8f129e1608ce?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Founder of a sustainable fashion brand utilizing recycled textiles from Kantamanto market to create high-end streetwear.', metadata: { Industry: 'Fashion', Experience: '3 Years', Location: 'Kumasi, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'p3', full_name: 'Yaw Boakye', nickname: 'YawFin', status: 'qualified' as ParticipantStatus, ranking: 3, vote_count: 39500, media_urls: { images: ['https://images.unsplash.com/photo-1506803682981-6e718a9dd3ee?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Democratizing access to credit for micro-SMEs across Accra through decentralized finance and mobile money rails.', metadata: { Industry: 'FinTech', Experience: '4 Years', Location: 'Accra, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'p4', full_name: 'Akosua Serwaa', nickname: 'KokoBuilds', status: 'qualified' as ParticipantStatus, ranking: null, vote_count: 21000, media_urls: { images: ['https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Building eco-friendly, affordable housing using locally sourced laterite and bamboo composites.', metadata: { Industry: 'Real Estate', Experience: '6 Years', Location: 'Tamale, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'p5', full_name: 'Kofi Annan Jr.', nickname: 'KofiTech', status: 'qualified' as ParticipantStatus, ranking: null, vote_count: 15400, media_urls: { images: ['https://images.unsplash.com/photo-1552699611-e2c208d538f1?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Creating robust e-learning platforms tailored for Ghanaian curriculums, making education accessible in remote areas.', metadata: { Industry: 'EdTech', Experience: '2 Years', Location: 'Cape Coast, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'p6', full_name: 'Esi Ofori', nickname: 'EsiHealth', status: 'evicted' as ParticipantStatus, ranking: null, vote_count: 8200, media_urls: { images: ['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Focused on deploying mobile health clinics focused on maternal care across the coastal regions.', metadata: { Industry: 'HealthTech', Experience: '4 Years', Location: 'Takoradi, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }
  ],

  mediaLibrary: [
    { id: 'm1', name: 'Hero Banner BG', url: 'https://images.unsplash.com/photo-1520095972714-909e91b05322?q=80&w=2000&auto=format&fit=crop', type: 'image', created_at: new Date().toISOString() },
    { id: 'm2', name: 'Audition Promo Video', url: 'https://www.youtube.com/watch?v=mock', type: 'video', created_at: new Date().toISOString() }
  ],

  blogPosts: [
    {
      id: 'b1',
      title: 'The Golden Standard: Accra Edition Commences',
      slug: 'golden-standard-accra-commences',
      excerpt: 'The Next Billionaire Path has officially launched its highly anticipated season in Accra, Ghana, bringing together the most brilliant young minds in business.',
      content: 'The journey to find the Next Billionaire has officially begun in the pulsing heart of West Africa: Accra, Ghana. Thousands of young Ghanaian innovators applied, but only a select few made it to the Master Gallery.\n\nThe competition will run for several intensive chapters where participants must prove their market viability, pitch to elite investors, and, most importantly, secure the raw financial vote of the public.\n\n"We are not looking for ordinary businesses; we are looking for absolute disruption," said the lead organizer. The initial data shows massive support for Tech and AgriTech, but Fashion is catching up. Keep an eye on the leaders.',
      image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
      category_id: null,
      is_published: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'b2',
      title: 'How Ghanaian Youth are Redefining Wealth',
      slug: 'how-ghanaian-youth-redefine-wealth',
      excerpt: 'From the streets of Kumasi to the boardrooms of Ridge, young entrepreneurs are building sustainable, tech-driven empires.',
      content: 'Gone are the days when wealth meant traditional imports. The new generation of Ghanaian youth is building wealth through code, sustainability, and cross-border innovation. The participants in the Next Billionaire Path reflect this shift vividly.\n\nWith access to digital payment rails and a growing smartphone economy, micro-SMEs are scaling 10x faster than traditional brick-and-mortar stores. This shift is clearly represented by our contestants.',
      image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
      category_id: null,
      is_published: true,
      is_featured: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'b3',
      title: 'The Rise of AgriTech in the Northern Regions',
      slug: 'rise-of-agritech-northern-regions',
      excerpt: 'Technology meets tradition as young founders tackle food security through smart farming solutions.',
      content: 'Agriculture has always been the backbone of Ghana\'s economy. However, recent data from the Next Billionaire Path auditions shows a massive influx of "Smart Farming" platforms coming primarily from Tamale and surrounding districts.\n\nFounders are utilizing drone logistics, soil AI, and direct-to-market USSD codes to cut out middlemen and empower rural farmers. One standout competitor stated that their ultimate goal is to turn local produce into globally traded commodities within five years.',
      image_url: 'https://images.unsplash.com/photo-1592652495393-4a11f26a8ac0?q=80&w=1200&auto=format&fit=crop',
      category_id: null,
      is_published: true,
      is_featured: false,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'b4',
      title: 'FinTech Founders Dominate Phase 1 Votes',
      slug: 'fintech-dominate-phase-1-votes',
      excerpt: 'Public voting indicates strong support for digital finance architectures and lending infrastructure platforms.',
      content: 'If the first wave of public voting is anything to go by, ordinary Ghanaians are heavily backing FinTech solutions. Access to credit and frictionless cross-border payments remain critical pain points. \n\nWe have observed a significant funding injection into contestants pitching decentralized finance systems that integrate directly with existing mobile money operator networks.',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
      category_id: null,
      is_published: true,
      is_featured: false,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString()
    }
  ],

  announcements: [],

  galleryItems: [],

  addVote: (participantId, amount) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === participantId ? { ...p, vote_count: p.vote_count + amount } : p
    )
  })),

  syncParticipants: async () => {
    try {
      const { getParticipantsAction } = await import('@/features/participants/actions');
      const data = await getParticipantsAction();
      if (data && data.length > 0) {
        set({ participants: data });
      } else {
        set({ participants: INITIAL_PARTICIPANTS });
      }
    } catch (err) {
      console.error('[Store] Error in syncParticipants:', err);
      set({ participants: INITIAL_PARTICIPANTS });
    }
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

  setSponsors: (sponsors) => set({ sponsors }),

  setBlogPosts: (blogPosts) => set({ blogPosts }),

  setParticipants: (participants) => set({ participants }),

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
    galleryItems: state.galleryItems.filter(g => g.id !== id)
  })),

  updateGalleryItemState: (id, updates) => set((state) => ({
    galleryItems: state.galleryItems.map(g => g.id === id ? { ...g, ...updates } : g)
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
    // If setting a new ranking to 1, 2, or 3, find if someone else already has it and nullify theirs
    const newParticipants = state.participants.map(p => {
      if (ranking !== null && p.ranking === ranking && p.id !== id) {
        return { ...p, ranking: null }; // Unseat the previous holder of this rank
      }
      if (p.id === id) {
        return { ...p, ranking: ranking as RankingTier | null };
      }
      return p;
    });
    return { participants: newParticipants };
  })
}));
