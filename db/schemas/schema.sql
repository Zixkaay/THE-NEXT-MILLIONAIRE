-- ==========================================
-- NEXT BILLIONAIRE PATH (NBP) DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL (Free Tier)
-- ==========================================

-- Enable requisite extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ADMINS TABLE (AUTHENTICATION SYSTEMWhitelisted ADMIN emails)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin' NOT NULL, -- e.g., 'super_admin', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for scanning whitelisted admin emails rapidly during login check
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- ==========================================
-- 2. SETTINGS TABLE (CENTRAL SYSTEM CONTROL ENGINE)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
    registration_open BOOLEAN DEFAULT TRUE NOT NULL,
    voting_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    video_upload_visible BOOLEAN DEFAULT TRUE NOT NULL,
    video_required BOOLEAN DEFAULT FALSE NOT NULL,
    vote_price NUMERIC(10, 2) DEFAULT 1.00 NOT NULL, -- cost in GHC per vote
    registration_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL, -- registration fee in GHC
    featured_blog_posts JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of blog post IDs
    featured_gallery_items JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of participant IDs / media IDs
    remove_registration_form BOOLEAN DEFAULT FALSE NOT NULL, -- Transform landing to partner/sponsor Ad Board
    advertising_title VARCHAR(255) DEFAULT 'Global Pitch Competition' NOT NULL,
    advertising_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1520095972714-909e91b05322?q=80&w=2000&auto=format&fit=crop' NOT NULL,
    advertising_link_url TEXT DEFAULT '/about' NOT NULL,
    advertising_text TEXT DEFAULT 'Sponsor a contestant or join with our high-net-worth mentors to accelerate the next business titan. Premium spectator path is now open.' NOT NULL,
    countdown_active BOOLEAN DEFAULT TRUE NOT NULL,
    countdown_event_name VARCHAR(255) DEFAULT 'AUDITION DAY' NOT NULL,
    countdown_target TEXT DEFAULT '' NOT NULL,
    site_logo_url TEXT DEFAULT 'https://res.cloudinary.com/dnhz6xwjz/image/upload/v1776840105/logo_ahkway.png' NOT NULL,
    site_background_url TEXT DEFAULT '' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_single_settings_row CHECK (id = 'global') -- Force single row
);

-- ==========================================
-- 3. PARTICIPANTS TABLE (PARTICIPANT LIFECYCLE MANAGEMENT)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.participants (
    id VARCHAR(50) PRIMARY KEY, -- Elegant Custom IDs: e.g., 'NBP-1001'
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    bio TEXT,
    status VARCHAR(50) DEFAULT 'registered' NOT NULL, -- registered, paid, auditioned, qualified, evicted
    ranking INTEGER DEFAULT NULL, -- Participant rank details (e.g. 1st, 2nd, 3rd performer or numerical positions)
    vote_count INTEGER DEFAULT 0 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- Captures answers to custom dynamic form builder fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT chk_participant_status CHECK (status IN ('registered', 'paid', 'auditioned', 'qualified', 'evicted'))
);

CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_vote_count ON public.participants(vote_count DESC);

-- ==========================================
-- 4. PARTICIPANT MEDIA TABLE (CLOUDINARY ATTACHMENTS CACHE)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.participant_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id VARCHAR(50) REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- 'image', 'video'
    url TEXT NOT NULL, -- Cloudinary secure CDN URL
    public_id VARCHAR(255), -- Cloudinary public ID for programmatic delete/replacement
    is_approved BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_participant_media_type CHECK (media_type IN ('image', 'video'))
);

CREATE INDEX IF NOT EXISTS idx_participant_media_participant ON public.participant_media(participant_id);

-- ==========================================
-- 5. PAYMENTS TABLE (PAYSTACK SECURITY INTEGRATION)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(100) NOT NULL UNIQUE, -- Paystack signature reference
    email VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL, -- stored in base currency (GHS GHC)
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- pending, success, failed
    payment_type VARCHAR(50) NOT NULL, -- 'registration', 'voting'
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- stores contextual parameters (e.g., participant_id, vote count count, tmp registration answers)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_payment_status CHECK (status IN ('pending', 'success', 'failed')),
    CONSTRAINT chk_payment_type CHECK (payment_type IN ('registration', 'voting'))
);

CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ==========================================
-- 6. VOTES TABLE (AUDIT TRAIL LOG FOR VOTES CAST)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id VARCHAR(50) REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    count INTEGER DEFAULT 1 NOT NULL, -- bulk voting support
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_votes_participant ON public.votes(participant_id);
CREATE INDEX IF NOT EXISTS idx_votes_payment ON public.votes(payment_id);

-- ==========================================
-- 7. VOTE TRANSACTIONS TABLE (MONETIZED VOTING DOUBLE-TRANSACTION PREVENTION SYSTEM)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vote_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(100) REFERENCES public.payments(reference) ON DELETE CASCADE NOT NULL UNIQUE,
    participant_id VARCHAR(50) REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
    vote_count INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    processed BOOLEAN DEFAULT FALSE NOT NULL, -- set to true only when votes are successfully accredited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vote_transactions_ref ON public.vote_transactions(payment_reference);

-- ==========================================
-- 8. FORM_FIELDS TABLE (DYNAMIC REGISTRATION FORM BUILDER)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE, -- used as mapping key in participant.metadata jsonb
    type VARCHAR(50) NOT NULL, -- text, textarea, select, file, number, email, checkbox
    required BOOLEAN DEFAULT FALSE NOT NULL,
    options JSONB DEFAULT '[]'::jsonb NOT NULL, -- dropdown options list
    placeholder VARCHAR(255),
    sort_order INTEGER DEFAULT 0 NOT NULL,
    step INTEGER DEFAULT 1 NOT NULL, -- Multi-step onboarding segmentation
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_form_fields_step_sort ON public.form_fields(step, sort_order);

-- ==========================================
-- 9. ANNOUNCEMENTS TABLE (HOMEPAGE BULLETIN PANEL)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT, -- Cloudinary link
    video_url TEXT, -- External Youtube or Cloudinary link
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);

-- ==========================================
-- 10. BLOG_CATEGORIES TABLE (ORGANIZATION AND CLASSIFICATION)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 11. BLOG_POSTS TABLE (DYNAMIC ARTICLE SYSTEM)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL, -- Rich Markdown content
    image_url TEXT NOT NULL, -- Cloudinary representation
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);

-- ==========================================
-- 12. MEDIA_LIBRARY TABLE (CENTRALIZED CLOUDINARY FILE POOL)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL, -- Cloudinary URL
    public_id VARCHAR(255) UNIQUE, -- Cloudinary asset public ID
    type VARCHAR(50) NOT NULL, -- 'image', 'video'
    source VARCHAR(50) DEFAULT 'cloudinary' NOT NULL, -- 'device', 'library', 'external'
    size_bytes BIGINT DEFAULT 0 NOT NULL, -- Filesize audit trace
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_media_library_type CHECK (type IN ('image', 'video')),
    CONSTRAINT chk_media_library_source CHECK (source IN ('device', 'library', 'external'))
);

CREATE INDEX IF NOT EXISTS idx_media_library_type ON public.media_library(type);

-- ==========================================
-- 13. GALLERY_ITEMS TABLE (MEDIA SHOWCASE MANAGER)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'image', 'video'
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_gallery_type CHECK (type IN ('image', 'video'))
);

-- ==========================================
-- 14. HERO_BANNERS TABLE (DYNAMIC HERO PANEL OVERLAYS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL, -- Cloudinary image target
    link_url TEXT, -- redirection action link
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 15. SPONSORS TABLE (SPONSORS CAROUSEL SYSTEM)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL, -- Cloudinary logo representation
    website_url TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 16. WEEKLY_RULES TABLE (COMPETITION RECOGNITION DECREES)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.weekly_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    week_number INTEGER NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 17. GENERAL_RULES TABLE (BASIC RULES DOCUMENTATION COMPONENT)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.general_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 18. CONTACT_MESSAGES TABLE (INBOX FOR USER COMMUNICATIONS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_unread ON public.contact_messages(is_read) WHERE is_read = FALSE;

-- ==========================================
-- 19. PDF_RECORDS TABLE (CREDENTIALS TRACKING ARCHIVE)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pdf_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id VARCHAR(50) REFERENCES public.participants(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100) REFERENCES public.payments(reference) ON DELETE SET NULL UNIQUE,
    pdf_type VARCHAR(50) NOT NULL, -- 'registration', 'receipt'
    pdf_url TEXT NOT NULL, -- Cloudinary CDN endpoint representing safe immutable document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_pdf_type CHECK (pdf_type IN ('registration', 'receipt'))
);

CREATE INDEX IF NOT EXISTS idx_pdf_records_participant ON public.pdf_records(participant_id);
