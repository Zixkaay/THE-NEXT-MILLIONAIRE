export type ParticipantStatus = 'registered' | 'paid' | 'auditioned' | 'qualified' | 'evicted';
export type RankingTier = 1 | 2 | 3;

// Table: public.admins
export interface DatabaseAdmin {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

// Table: public.settings
export interface DatabaseSettings {
  id: string; // e.g., 'global'
  registration_open: boolean;
  voting_enabled: boolean;
  video_upload_visible: boolean;
  video_required: boolean;
  vote_price: number;
  registration_fee?: number;
  featured_blog_posts: string[]; // Array of blog post IDs
  featured_gallery_items: string[]; // Array of participant IDs / media IDs
  updated_at: string;
  remove_registration_form?: boolean;
  advertising_title?: string;
  advertising_image_url?: string;
  advertising_link_url?: string;
  advertising_text?: string;
  countdown_active?: boolean;
  countdown_event_name?: string;
  countdown_target?: string;
  site_logo_url?: string;
  site_background_url?: string;
  prize_pool_ghc?: string;
  about_mission?: string;
  about_vision?: string;
}

// Table: public.participants
export interface DatabaseParticipant {
  id: string;
  full_name: string;
  nickname: string | null;
  bio: string | null;
  status: ParticipantStatus;
  ranking: number | null;
  vote_count: number;
  media_urls: {
    images: string[];
    videos: string[];
  };
  metadata: Record<string, any>; // Used as JSONB for dynamic form fields
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Table: public.participant_media
export interface DatabaseParticipantMedia {
  id: string;
  participant_id: string;
  media_type: 'image' | 'video';
  url: string;
  public_id: string | null;
  is_approved: boolean;
  created_at: string;
}

// Table: public.payments
export interface DatabasePayment {
  id: string;
  reference: string;
  email: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  payment_type: 'registration' | 'voting';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Table: public.votes
export interface DatabaseVote {
  id: string;
  participant_id: string;
  payment_id: string | null;
  count: number;
  created_at: string;
}

// Table: public.vote_transactions
export interface DatabaseVoteTransaction {
  id: string;
  payment_reference: string;
  participant_id: string;
  vote_count: number;
  amount: number;
  processed: boolean;
  created_at: string;
}

// Table: public.form_fields
export interface DatabaseFormField {
  id: string;
  label: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'file' | 'number' | 'email' | 'checkbox';
  required: boolean;
  options: string[]; // dropdown option values parsed from JSONB array
  placeholder: string | null;
  sort_order: number;
  step: number;
  is_enabled: boolean;
  created_at: string;
}

// Table: public.announcements
export interface DatabaseAnnouncement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Table: public.blog_categories
export interface DatabaseBlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Table: public.blog_posts
export interface DatabaseBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Table: public.media_library
export interface DatabaseMediaLibrary {
  id: string;
  name: string;
  url: string;
  public_id: string | null;
  type: 'image' | 'video';
  source: 'device' | 'library' | 'external';
  size_bytes: number;
  created_at: string;
}

// Table: public.gallery_items
export interface DatabaseGalleryItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: 'image' | 'video';
  featured: boolean;
  created_at: string;
}

// Table: public.hero_banners
export interface DatabaseHeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  created_at: string;
}

// Table: public.sponsors
export interface DatabaseSponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
  created_at: string;
}

// Table: public.weekly_rules
export interface DatabaseWeeklyRule {
  id: string;
  title: string;
  description: string;
  week_number: number;
  is_active: boolean;
  created_at: string;
}

// Table: public.general_rules
export interface DatabaseGeneralRule {
  id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
}

// Table: public.contact_messages
export interface DatabaseContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Table: public.pdf_records
export interface DatabasePdfRecord {
  id: string;
  participant_id: string | null;
  payment_reference: string | null;
  pdf_type: 'registration' | 'receipt';
  pdf_url: string;
  created_at: string;
}

// Full Schema Definition
export interface Database {
  public: {
    Tables: {
      admins: {
        Row: DatabaseAdmin;
        Insert: Omit<DatabaseAdmin, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseAdmin, 'id'>>;
      };
      settings: {
        Row: DatabaseSettings;
        Insert: Omit<DatabaseSettings, 'id' | 'updated_at'>;
        Update: Partial<Omit<DatabaseSettings, 'id'>>;
      };
      participants: {
        Row: DatabaseParticipant;
        Insert: Omit<DatabaseParticipant, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseParticipant, 'id' | 'created_at'>>;
      };
      participant_media: {
        Row: DatabaseParticipantMedia;
        Insert: Omit<DatabaseParticipantMedia, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseParticipantMedia, 'id' | 'created_at'>>;
      };
      payments: {
        Row: DatabasePayment;
        Insert: Omit<DatabasePayment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabasePayment, 'id' | 'created_at'>>;
      };
      votes: {
        Row: DatabaseVote;
        Insert: Omit<DatabaseVote, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseVote, 'id' | 'created_at'>>;
      };
      vote_transactions: {
        Row: DatabaseVoteTransaction;
        Insert: Omit<DatabaseVoteTransaction, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseVoteTransaction, 'id' | 'created_at'>>;
      };
      form_fields: {
        Row: DatabaseFormField;
        Insert: Omit<DatabaseFormField, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseFormField, 'id' | 'created_at'>>;
      };
      announcements: {
        Row: DatabaseAnnouncement;
        Insert: Omit<DatabaseAnnouncement, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseAnnouncement, 'id' | 'created_at'>>;
      };
      blog_categories: {
        Row: DatabaseBlogCategory;
        Insert: Omit<DatabaseBlogCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseBlogCategory, 'id' | 'created_at'>>;
      };
      blog_posts: {
        Row: DatabaseBlogPost;
        Insert: Omit<DatabaseBlogPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseBlogPost, 'id' | 'created_at'>>;
      };
      media_library: {
        Row: DatabaseMediaLibrary;
        Insert: Omit<DatabaseMediaLibrary, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseMediaLibrary, 'id' | 'created_at'>>;
      };
      gallery_items: {
        Row: DatabaseGalleryItem;
        Insert: Omit<DatabaseGalleryItem, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseGalleryItem, 'id' | 'created_at'>>;
      };
      hero_banners: {
        Row: DatabaseHeroBanner;
        Insert: Omit<DatabaseHeroBanner, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseHeroBanner, 'id' | 'created_at'>>;
      };
      sponsors: {
        Row: DatabaseSponsor;
        Insert: Omit<DatabaseSponsor, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseSponsor, 'id' | 'created_at'>>;
      };
      weekly_rules: {
        Row: DatabaseWeeklyRule;
        Insert: Omit<DatabaseWeeklyRule, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseWeeklyRule, 'id' | 'created_at'>>;
      };
      general_rules: {
        Row: DatabaseGeneralRule;
        Insert: Omit<DatabaseGeneralRule, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseGeneralRule, 'id' | 'created_at'>>;
      };
      contact_messages: {
        Row: DatabaseContactMessage;
        Insert: Omit<DatabaseContactMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseContactMessage, 'id' | 'created_at'>>;
      };
      pdf_records: {
        Row: DatabasePdfRecord;
        Insert: Omit<DatabasePdfRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabasePdfRecord, 'id' | 'created_at'>>;
      };
    };
  };
}
