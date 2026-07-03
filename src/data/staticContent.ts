// src/data/staticContent.ts
import { ParticipantStatus, RankingTier } from '@/types/database';

export const DEFAULT_FORM_STEPS = [
  {
    number: 1,
    title: "Identity",
    fields: [
      { id: "full_name", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { id: "sex", label: "Sex", type: "select", required: true, options: ["Male", "Female"] },
      { id: "age", label: "Age", type: "number", placeholder: "Age", required: true },
      { id: "date_of_birth", label: "Date of Birth", type: "date", required: true },
      { id: "hometown", label: "Hometown", type: "text", placeholder: "e.g. Kumasi", required: true },
      { id: "current_location", label: "Current Location", type: "text", placeholder: "Where do you live now?", required: true },
      { id: "languages", label: "Languages Spoken", type: "text", placeholder: "e.g. English, Twi, Ga", required: true }
    ]
  },
  {
    number: 2,
    title: "Experience",
    fields: [
      { id: "student_status", label: "Student Status", type: "select", required: true, options: ["Current Student", "Graduate", "Not a student"] },
      { id: "business_experience", label: "Business Experience (Years & Type)", type: "textarea", placeholder: "Detail your entrepreneurial journey...", required: true }
    ]
  },
  {
    number: 3,
    title: "Contact",
    fields: [
      { id: "telephone", label: "Telephone", type: "tel", placeholder: "Phone number", required: true },
      { id: "email", label: "Email Address", type: "email", placeholder: "Email address", required: true },
      { id: "mothers_contact", label: "Mother's Name & Phone", type: "text", placeholder: "Name - Phone", required: false },
      { id: "fathers_contact", label: "Father's Name & Phone", type: "text", placeholder: "Name - Phone", required: false },
      { id: "emergency_contact", label: "Emergency Contact Person", type: "text", placeholder: "Name, Relationship, Phone", required: true }
    ]
  },
  {
    number: 4,
    title: "Media Showcase",
    fields: [
      { id: "pitch_video", label: "Pitch Video", type: "video", required: false }
    ]
  }
];

export const INITIAL_PARTICIPANTS = [
  {
    id: 'p1', full_name: 'Kwame Osei', nickname: 'TechKwame', status: 'qualified' as ParticipantStatus, ranking: 1 as RankingTier, vote_count: 54320, media_urls: { images: ['https://images.unsplash.com/photo-1543807535-ecefc092c2da?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Pioneering AI-driven logistics for rural farmers in Ghana. Visionary leader aiming to digitize the agricultural supply chain from farm to market.', metadata: { Industry: 'AgriTech', Experience: '5 Years', Location: 'Accra, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'p2', full_name: 'Ama Mensah', nickname: 'AmaInnovates', status: 'qualified' as ParticipantStatus, ranking: 2 as RankingTier, vote_count: 42100, media_urls: { images: ['https://images.unsplash.com/photo-1531123897727-8f129e1608ce?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Founder of a sustainable fashion brand utilizing recycled textiles from Kantamanto market to create high-end streetwear.', metadata: { Industry: 'Fashion', Experience: '3 Years', Location: 'Kumasi, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  },
  {
    id: 'p3', full_name: 'Yaw Boakye', nickname: 'YawFin', status: 'qualified' as ParticipantStatus, ranking: 3 as RankingTier, vote_count: 39500, media_urls: { images: ['https://images.unsplash.com/photo-1506803682981-6e718a9dd3ee?q=80&w=1000&auto=format&fit=crop'], videos: [] }, bio: 'Democratizing access to credit for micro-SMEs across Accra through decentralized finance and mobile money rails.', metadata: { Industry: 'FinTech', Experience: '4 Years', Location: 'Accra, Ghana' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
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
];
