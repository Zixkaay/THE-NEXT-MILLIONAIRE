import { useAppStore } from '@/store/useAppStore';

/**
 * All system-wide toggles MUST be in /config/systemConfig.ts
 * Rules:
 * * Registration state
 * * Voting state
 * * Feature flags
 * 
 * ❌ No hardcoded system states anywhere else
 */

export interface SystemConfig {
  registration_open: boolean;
  voting_enabled: boolean;
  video_upload_visible: boolean;
  video_required: boolean;
}

// Global System Configuration State Getter
export const getSystemConfig = (): SystemConfig => {
  try {
    const settings = useAppStore.getState().settings;
    return {
      registration_open: settings?.registration_open ?? true,
      voting_enabled: settings?.voting_enabled ?? false,
      video_upload_visible: settings?.video_upload_visible ?? true,
      video_required: settings?.video_required ?? false,
    };
  } catch (e) {
    // Fallback if accessed before store initialization or outside React tree
    return {
      registration_open: true,
      voting_enabled: false,
      video_upload_visible: true,
      video_required: false,
    };
  }
};

// System Feature Flags
export const FEATURE_FLAGS = {
  enable_video_uploads: true,
  enableSponsorsScroll: true,
  enableCentralMediaLibrary: true,
  max_video_size_mb: 50,
};

// Available states
export type RegistrationState = 'Open' | 'Closed';
export type VotingState = 'Enabled' | 'Disabled';
export type VideoUploadState = 'Visible' | 'Hidden';
export type VideoRequirementState = 'Required' | 'Optional';

// Dynamic Form Builder Typings
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'tel' | 'email' | 'select' | 'textarea' | 'video';
  placeholder?: string;
  required: boolean;
  options?: string[]; // For 'select' dropdown type
}

export interface FormStep {
  number: number;
  title: string;
  fields: FormField[];
}

// Default dynamic configuration schema (parsed JSONB)
export const DEFAULT_FORM_STEPS: FormStep[] = [
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
