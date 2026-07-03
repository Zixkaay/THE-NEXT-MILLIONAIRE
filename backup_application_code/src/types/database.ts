export type ParticipantStatus = 'Pending' | 'Approved' | 'Evicted';
export type RankingTier = 1 | 2 | 3 | 4 | 5;

// Table: settings
export interface DatabaseSettings {
  id: string; // e.g., 'global'
  registration_open: boolean;
  voting_enabled: boolean;
  video_upload_visible: boolean;
  video_required: boolean;
  featured_blog_posts: string[]; // Array of blog post IDs
  featured_gallery_items: string[]; // Array of participant IDs
  updated_at: string;
}

// Table: participants
export interface DatabaseParticipant {
  id: string;
  full_name: string;
  nickname: string;
  bio: string;
  status: ParticipantStatus;
  ranking: RankingTier | null;
  vote_count: number;
  media_urls: {
    images: string[];
    videos: string[];
  }; // Used as JSONB
  metadata: Record<string, string | number | boolean | null>; // Used as JSONB for dynamic form fields
  created_at: string;
  updated_at: string;
}

// Table: blog_posts
export interface DatabaseBlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or rich text HTML
  is_featured: boolean;
  image_url: string;
  created_at: string;
}

// Table: media_library
export interface DatabaseMediaLibrary {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  source: 'internal' | 'cloudinary' | 'external';
  size_bytes: number; // to track the 50MB limit max
  created_at: string;
}

// Full Schema Definition
export interface Database {
  public: {
    Tables: {
      settings: {
        Row: DatabaseSettings;
        Insert: Omit<DatabaseSettings, 'id' | 'updated_at'>;
        Update: Partial<Omit<DatabaseSettings, 'id'>>;
      };
      participants: {
        Row: DatabaseParticipant;
        Insert: Omit<DatabaseParticipant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseParticipant, 'id' | 'created_at'>>;
      };
      blog_posts: {
        Row: DatabaseBlogPost;
        Insert: Omit<DatabaseBlogPost, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseBlogPost, 'id' | 'created_at'>>;
      };
      media_library: {
        Row: DatabaseMediaLibrary;
        Insert: Omit<DatabaseMediaLibrary, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseMediaLibrary, 'id' | 'created_at'>>;
      };
    };
  };
}
