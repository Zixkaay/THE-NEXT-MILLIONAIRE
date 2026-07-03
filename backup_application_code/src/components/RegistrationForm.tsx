import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, UploadCloud, CheckCircle, ChevronDown, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { DEFAULT_FORM_STEPS, FormStep, FormField, getSystemConfig } from '@/config/systemConfig';

export function RegistrationForm() {
  const { settings } = useAppStore();
  
  // Platform configuration state
  const config = getSystemConfig();
  const videoUploadVisible = config.video_upload_visible;
  const videoRequired = config.video_required;

  const [formSteps, setFormSteps] = useState<FormStep[]>([]);
  const [fetchingConfig, setFetchingConfig] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const fallbackFiltered = DEFAULT_FORM_STEPS.map(step => {
      return {
        ...step,
        fields: step.fields.filter(field => {
          if (field.type === 'video') {
            return videoUploadVisible;
          }
          return true;
        })
      };
    }).filter(step => step.fields.length > 0);
    setFormSteps(fallbackFiltered);
    setFetchingConfig(false);
  }, [videoUploadVisible]);

  const currentStep = formSteps[stepIndex];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [valError, setValError] = useState<string | null>(null);
  
  // Files uploading states
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load progress on mounting (localStorage hydration)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nbp_registration_progress_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          setAnswers(parsed);
          // If a pitch video was already uploaded, restore its state
          if (parsed.pitch_video) {
            setUploadedFileUrl(parsed.pitch_video);
            setUploadedFileName('Already Uploaded Video.mp4');
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore progress draft.', e);
    }
  }, []);

  // Save progress locally on changes of answers dictionary
  const updateAnswer = (fieldId: string, val: string) => {
    const nextAnswers = { ...answers, [fieldId]: val };
    setAnswers(nextAnswers);
    setValError(null);
    try {
      localStorage.setItem('nbp_registration_progress_draft', JSON.stringify(nextAnswers));
    } catch (e) {
      console.error(e);
    }
  };

  // Perform rigorous client-side validation for the current step
  const validateCurrentStep = (): boolean => {
    if (!currentStep) return true;
    
    for (const field of currentStep.fields) {
      const value = (answers[field.id] || '').trim();
      
      // Mandatory checker
      if (field.required && !value) {
        // Special case: video field
        if (field.type === 'video' && videoUploadVisible && videoRequired) {
          setValError('Please upload your audition showcase pitch video.');
          return false;
        }
        setValError(`"${field.label}" is required.`);
        return false;
      }

      // Email formatting validity
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setValError('Please provide a valid email address.');
          return false;
        }
      }

      // Age parameters validity
      if (field.id === 'age' && value) {
        const ageNum = parseInt(value, 10);
        if (isNaN(ageNum) || ageNum < 18) {
          setValError('You must be 18 years of age or older to enter.');
          return false;
        }
      }

      // Telephone digits count validity
      if (field.type === 'tel' && value) {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 8) {
          setValError('Please enter a valid telephone number.');
          return false;
        }
      }
    }

    setValError(null);
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStepIndex(prev => Math.min(prev + 1, formSteps.length - 1));
    }
  };

  const handleBack = () => {
    setValError(null);
    setStepIndex(prev => Math.max(prev - 1, 0));
  };

  // Secure File Upload Process mapping to the Express backend proxy
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Check size limitations (50MB matches PRD)
    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setValError(`File size exceeds the ${MAX_SIZE_MB}MB limit. Please compress your video.`);
      return;
    }

    setIsUploadingFile(true);
    setValError(null);
    setUploadProgress(15);

    try {
      // Mocking file upload since backend API is being removed
      setUploadProgress(100);
      setUploadedFileUrl('https://via.placeholder.com/150');
      setUploadedFileName(file.name);
      updateAnswer('pitch_video', 'https://via.placeholder.com/150');
    } catch (err: any) {
      setValError(err?.message || 'Video transport caught connection exceptions. Please retry.');
    } finally {
      setIsUploadingFile(false);
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  // Submitting Payload & Initializing Paystack Integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    // Last step safety validations
    if (videoUploadVisible && videoRequired && !uploadedFileUrl) {
      setValError('Showcase Pitch Video is mandatory. Please upload a video.');
      return;
    }

    setIsSubmitting(true);
    setValError(null);

    try {
      // Mocking submission success since backend API is being removed
      console.log('Registration submitted:', answers);
      alert('Registration successful! (Demo mode - no payment processed)');
      
      // Clear layout draft files on routing
      localStorage.removeItem('nbp_registration_progress_draft');
      setIsSubmitting(false);
      // Redirect to a dummy success page in a real app, just stay here for now.
    } catch (err: any) {
      setValError(err?.message || 'Port settlement pipeline disrupted. Try again later.');
      setIsSubmitting(false);
    }
  };

  const isFinalStep = stepIndex === formSteps.length - 1;

  const inputClass = "w-full bg-gradient-to-b from-[#F5EFE1] to-[#FAF6EE] border-[1.5px] border-[#C59B46] rounded-full px-5 py-3.5 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/60 outline-none focus:border-[#A67C00] focus:ring-1 focus:ring-[#A67C00] transition-all shadow-[inset_0_0_12px_rgba(212,175,55,0.25),0_2px_4px_rgba(0,0,0,0.05)] font-sans";
  const selectClass = "w-full bg-gradient-to-b from-[#F5EFE1] to-[#FAF6EE] border-[1.5px] border-[#C59B46] rounded-full px-5 py-3.5 text-sm text-[#1a1a1a] appearance-none outline-none focus:border-[#A67C00] focus:ring-1 focus:ring-[#A67C00] transition-all shadow-[inset_0_0_12px_rgba(212,175,55,0.25),0_2px_4px_rgba(0,0,0,0.05)] font-sans";
  const labelClass = "text-[10px] font-black text-[#1a1a1a] uppercase tracking-widest block mb-1.5 opacity-80 pl-2 font-mono";

  if (fetchingConfig) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#C59B46] mb-3" size={32} />
        <p className="text-xs font-black text-[#1a1a1a] uppercase tracking-widest pl-2 font-mono">Loading dynamic configuration fields...</p>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="w-full">
      {/* Steps Tracking Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#C59B46]/20 relative z-10 select-none">
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black text-[#1a1a1a]/40 uppercase tracking-widest font-mono">Progress Metric</span>
          <span className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider font-sans">
            Step {stepIndex + 1} of {formSteps.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {formSteps.map((_, sIdx) => (
            <div 
              key={sIdx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${sIdx === stepIndex ? 'w-8 bg-[#1a1a1a]' : sIdx < stepIndex ? 'w-3 bg-[#C59B46]' : 'w-2 bg-[#C59B46]/30'}`} 
            />
          ))}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
        
        {/* Dynamic Fields Parser */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-[#1a1a1a] uppercase tracking-wider font-sans border-b border-[#C59B46]/10 pb-2 mb-4">
            Section {stepIndex + 1}: {currentStep.title}
          </h3>

          {currentStep.fields.map((field) => {
            const val = answers[field.id] || '';

            return (
              <div key={field.id} className="text-left">
                <label className={labelClass}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {/* Input Text / Date / Age / Email */}
                {['text', 'number', 'date', 'tel', 'email'].includes(field.type) && (
                  <input
                    type={field.type}
                    value={val}
                    onChange={(e) => updateAnswer(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputClass}
                    required={field.required}
                  />
                )}

                {/* Select Dropdown Type */}
                {field.type === 'select' && (
                  <div className="relative">
                    <select
                      value={val}
                      onChange={(e) => updateAnswer(field.id, e.target.value)}
                      className={selectClass}
                      required={field.required}
                    >
                      <option value="">Select Option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C59B46] pointer-events-none" size={16} />
                  </div>
                )}

                {/* Textarea Paragraphs Type */}
                {field.type === 'textarea' && (
                  <textarea
                    value={val}
                    onChange={(e) => updateAnswer(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    required={field.required}
                    className="w-full bg-gradient-to-b from-[#F5EFE1] to-[#FAF6EE] border-[1.5px] border-[#C59B46] rounded-[2rem] px-5 py-4 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/60 outline-none focus:border-[#A67C00] focus:ring-1 focus:ring-[#A67C00] transition-all shadow-[inset_0_0_12px_rgba(212,175,55,0.25),0_2px_4px_rgba(0,0,0,0.05)] font-sans"
                  />
                )}

                {/* Video Upload Field Type */}
                {field.type === 'video' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="video/mp4,video/mkv,video/avi"
                      className="hidden"
                    />
                    
                    {uploadedFileUrl ? (
                      <div className="border-[1.5px] border-green-500 p-5 rounded-3xl bg-green-500/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                            <Check size={18} />
                          </span>
                          <div className="truncate text-left">
                            <span className="block text-xs font-black text-black">Pitch Video Captured</span>
                            <span className="block text-[10px] text-zinc-500 truncate">{uploadedFileName}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileUrl(null);
                            setUploadedFileName(null);
                            updateAnswer('pitch_video', '');
                          }}
                          className="text-xs text-red-500 hover:text-red-700 font-extrabold uppercase tracking-wide"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => !isUploadingFile && fileInputRef.current?.click()}
                        className={`border border-dashed border-[#C59B46] p-8 rounded-[2rem] flex flex-col items-center justify-center text-center bg-white/40 hover:bg-white cursor-pointer transition-colors shadow-sm group select-none ${isUploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="w-12 h-12 bg-white border border-[#C59B46]/30 rounded-full flex items-center justify-center text-[#A67C00] mb-3 group-hover:scale-105 transition-transform shadow-md">
                          {isUploadingFile ? (
                            <Loader2 className="animate-spin text-accent" size={20} />
                          ) : (
                            <UploadCloud size={20} />
                          )}
                        </div>
                        
                        {isUploadingFile ? (
                          <div className="space-y-1">
                            <p className="text-xs font-black text-black uppercase">Settling Video on Server...</p>
                            {uploadProgress && (
                              <div className="w-40 h-1.5 bg-zinc-200 rounded-full overflow-hidden mx-auto">
                                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-black text-black uppercase tracking-wider mb-1">Upload Showcase Pitch Video</p>
                            <span className="text-[10px] text-zinc-500 uppercase font-medium">Accepts MP4, MKV up to 50MB</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Runtime Error Panel */}
        {valError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-2xl flex items-center gap-2.5 animate-bounce">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold text-left">{valError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-4 pt-4 border-t border-[#C59B46]/10">
          {stepIndex > 0 && (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              type="button"
              className="flex-1 py-3.5 bg-transparent border-2 border-[#1a1a1a]/20 text-[#1a1a1a] font-extrabold text-[10px] md:text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:bg-[#1a1a1a]/5 transition-colors disabled:opacity-45"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {!isFinalStep ? (
            <button
              onClick={handleNext}
              type="button"
              className="flex-1 py-4 bg-[#050B14] text-white font-extrabold text-[10px] md:text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all shadow-md active:scale-95"
            >
              Next Step <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploadingFile}
              type="button"
              className="flex-1 py-4 bg-[#050B14] text-[#ffc107] font-black text-[10px] md:text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Starting Checkout...
                </>
              ) : (
                <>
                  Register & Pay GHC 150 <ArrowRight size={14} />
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
