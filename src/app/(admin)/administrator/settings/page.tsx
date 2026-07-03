'use client';

import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getSettingsAction, updateSettingsAction } from '@/features/settings/actions';
import { AdminMediaSelector } from '@/components/AdminMediaSelector';

export default function AdminSettingsPage() {
  const { settings, updateSettings, sponsors, addSponsor, removeSponsor } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [date, setDate] = useState('');
  const [prize, setPrize] = useState('');
  const [sponsorName, setSponsorName] = useState('');

  // States for Phase 4 system controls
  const [regOpen, setRegOpen] = useState(true);
  const [votingOn, setVotingOn] = useState(false);
  const [videoUploadVisible, setVideoUploadVisible] = useState(true);
  const [videoRequired, setVideoRequired] = useState(false);
  const [votePrice, setVotePrice] = useState(1.00);
  const [registrationFee, setRegistrationFee] = useState(0.00);
  
  // Extension for layout and Advertising Board
  const [removeRegForm, setRemoveRegForm] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adText, setAdText] = useState('');

  // Branding & Countdown extension states
  const [countdownActive, setCountdownActive] = useState(true);
  const [countdownEventName, setCountdownEventName] = useState('Audition Countdown');
  const [selectedMilestone, setSelectedMilestone] = useState('Audition Countdown');
  const [siteLogoUrl, setSiteLogoUrl] = useState('');
  const [siteBackgroundUrl, setSiteBackgroundUrl] = useState('');

  // Sync settings with database on mount
  useEffect(() => {
    async function loadDbSettings() {
      try {
        const dbSettings = await getSettingsAction();
        if (dbSettings) {
          updateSettings(dbSettings);
          
          setRegOpen(dbSettings.registration_open);
          setVotingOn(dbSettings.voting_enabled);
          setVideoUploadVisible(dbSettings.video_upload_visible);
          setVideoRequired(dbSettings.video_required);
          setVotePrice(dbSettings.vote_price ?? 1.00);
          setRegistrationFee(dbSettings.registration_fee ?? 0.00);
          setRemoveRegForm(dbSettings.remove_registration_form ?? false);
          setAdTitle(dbSettings.advertising_title ?? 'Global Pitch Competition');
          setAdImageUrl(dbSettings.advertising_image_url ?? 'https://images.unsplash.com/photo-1520095972714-909e91b05322?q=80&w=2000&auto=format&fit=crop');
          setAdLinkUrl(dbSettings.advertising_link_url ?? '/about');
          setAdText(dbSettings.advertising_text ?? 'Sponsor a contestant or join with our high-net-worth mentors to accelerate the next business titan. Premium spectator path is now open.');

          // Format target date safely
          const targetDate = new Date((dbSettings as any).countdown_target || settings.countdown_target || Date.now());
          targetDate.setMinutes(targetDate.getMinutes() - targetDate.getTimezoneOffset());
          setDate(targetDate.toISOString().slice(0, 16));
          
          setPrize((dbSettings as any).prize_pool_ghc || settings.prize_pool_ghc || '1,000,000+');

          // Countdown & Branding loader
          setCountdownActive(dbSettings.countdown_active !== false);
          const eventName = dbSettings.countdown_event_name ?? 'Audition Countdown';
          setCountdownEventName(eventName);
          setSiteLogoUrl(dbSettings.site_logo_url ?? '');
          setSiteBackgroundUrl(dbSettings.site_background_url ?? '');
          
          const predefinedMilestones = [
            "Audition Countdown",
            "Voter Registration Day",
            "Grand Auditions",
            "Elimination Round",
            "Semifinals",
            "Grand Finale"
          ];
          setSelectedMilestone(predefinedMilestones.includes(eventName) ? eventName : 'Custom Event Name');
        }
      } catch (err) {
        console.error('[AdminSettings] Error loading external configuration:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDbSettings();
  }, [updateSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setToast(null);

    try {
      // 1. Write updated state to database settings registry
      const result = await updateSettingsAction({
        registration_open: regOpen,
        voting_enabled: votingOn,
        video_upload_visible: videoUploadVisible,
        video_required: videoRequired,
        vote_price: votePrice,
        registration_fee: registrationFee,
        remove_registration_form: removeRegForm,
        advertising_title: adTitle,
        advertising_image_url: adImageUrl,
        advertising_link_url: adLinkUrl,
        advertising_text: adText,
        countdown_active: countdownActive,
        countdown_event_name: countdownEventName,
        site_logo_url: siteLogoUrl,
        site_background_url: siteBackgroundUrl,
        countdown_target: new Date(date).toISOString(),
        prize_pool_ghc: prize,
      });

      if (!result.success) {
        throw new Error(result.message || 'Error writing to backend database.');
      }

      // 2. Synchronize Zustand store in client memory
      updateSettings({
        countdown_target: new Date(date).toISOString(),
        prize_pool_ghc: prize,
        registration_open: regOpen,
        voting_enabled: votingOn,
        video_upload_visible: videoUploadVisible,
        video_required: videoRequired,
        vote_price: votePrice,
        registration_fee: registrationFee,
        remove_registration_form: removeRegForm,
        advertising_title: adTitle,
        advertising_image_url: adImageUrl,
        advertising_link_url: adLinkUrl,
        advertising_text: adText,
        countdown_active: countdownActive,
        countdown_event_name: countdownEventName,
        site_logo_url: siteLogoUrl,
        site_background_url: siteBackgroundUrl,
      });

      setToast({ 
        type: 'success', 
        message: 'System settings successfully updated in Central Registry.' 
      });

      // Auto dismiss success toast
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('[AdminSettings] Error updating settings:', err);
      setToast({ 
        type: 'error', 
        message: err.message || 'Failed to persist new system-configurations to cloud datastore.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSponsor = () => {
    if (sponsorName.trim()) {
      addSponsor({
        id: 's' + Date.now(),
        name: sponsorName.trim(),
        logo_type: 'text',
        logo_content: sponsorName.trim().charAt(0).toUpperCase()
      });
      setSponsorName('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading Registry Configurations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col gap-2">
        <p className="text-[#A3A3A3] text-sm font-bold uppercase tracking-wider mb-1">Globals</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Platform Settings</h1>
        {toast && (
          <div className={`p-4 rounded-xl border text-sm font-bold flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-xs uppercase tracking-wider font-extrabold hover:underline">Dismiss</button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4 mb-6">
               <h2 className="text-xl font-bold text-white">General Details</h2>
            </div>
            
            <div className="space-y-5 text-left">
              <div>
                <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2">Countdown Target Date</label>
                <input 
                  type="datetime-local" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm outline-none focus:border-[#d4af37] text-white" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2">Total Prize Pool (GHC)</label>
                <input 
                  type="text" 
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm outline-none focus:border-[#d4af37] text-white" 
                  placeholder="e.g. 1,000,000+"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">Project Name</label>
                <input type="text" className="w-full mt-1.5 px-4 py-3 bg-bg border border-border rounded-xl text-sm text-white" defaultValue="Next Billionaire Path" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">Support Email</label>
                <input type="text" className="w-full mt-1.5 px-4 py-3 bg-bg border border-border rounded-xl text-sm text-white" defaultValue="directors@nextbillionaire.io" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2">Registration Fee (GHC)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(parseFloat(e.target.value) !== undefined ? parseFloat(e.target.value) : 0)}
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm outline-none focus:border-[#d4af37] text-white" 
                    placeholder="e.g. 150.00"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Set 0 to make registration free</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2">Vote Pricing (GHC)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={votePrice}
                    onChange={(e) => setVotePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm outline-none focus:border-[#d4af37] text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2">Currency Base</label>
                  <select className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm outline-none text-white select:bg-[#1a1a1a]">
                    <option>GHC</option>
                    <option>USD</option>
                    <option>NGN</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-border space-y-4">
                 <div>
                    <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2">About Mission Text</label>
                    <textarea 
                      value={settings.about_mission || ''}
                      onChange={(e) => updateSettings({ about_mission: e.target.value })}
                      className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm outline-none focus:border-[#d4af37] min-h-[100px] text-white" 
                      placeholder="Enter mission statements..."
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2">About Vision Text</label>
                    <textarea 
                      value={settings.about_vision || ''}
                      onChange={(e) => updateSettings({ about_vision: e.target.value })}
                      className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm outline-none focus:border-[#d4af37] min-h-[100px] text-white" 
                      placeholder="Enter vision statements..."
                    />
                 </div>
              </div>
            </div>
          </div>

          {/* Site Branding & Assets */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="border-b border-[#262626] pb-4 text-left">
               <h2 className="text-xl font-bold text-white font-sans">Site Branding & Assets</h2>
               <p className="text-xs text-[#A3A3A3] mt-1 font-sans font-medium">Configure customized branding details and layouts across public pages using device uploads, internal library archives, or URLs.</p>
            </div>
            
            <div className="space-y-6 text-left">
              <div>
                <AdminMediaSelector
                  value={siteLogoUrl}
                  onChange={(url) => setSiteLogoUrl(url)}
                  label="Site Brand Logo"
                  type="image"
                />
                <p className="text-[10px] text-[#A3A3A3] mt-2 leading-normal px-1">Specify a custom site logo to override the default brand logo asset. Supports device upload, media library catalogs, or hotlinked URLs.</p>
              </div>

              <div>
                <AdminMediaSelector
                  value={siteBackgroundUrl}
                  onChange={(url) => setSiteBackgroundUrl(url)}
                  label="Global Site Background Image"
                  type="image"
                />
                <p className="text-[10px] text-[#A3A3A3] mt-2 leading-normal px-1">Upload or choose a background image to display globally as a darkened visual backing across public screens.</p>
              </div>
            </div>
          </div>

          {/* Countdown Controls */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="border-b border-[#262626] pb-4 text-left">
               <h2 className="text-xl font-bold text-white font-sans">Countdown Configurator</h2>
               <p className="text-xs text-[#A3A3A3] mt-1 font-sans font-medium">Set state toggles, predefined milestone events, or custom text configurations for the global countdown bar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1 font-mono">Countdown Status</span>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${countdownActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {countdownActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed">When set to inactive, the countdown timer immediately displays as halted at zero showing the event headline text.</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Countdown Active</span>
                  <button 
                    onClick={() => setCountdownActive(!countdownActive)}
                    type="button"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${countdownActive ? 'bg-[#d4af37]' : 'bg-neutral-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${countdownActive ? 'translate-x-5 bg-black' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-2 font-mono">Milestone Event Type</label>
                    <select 
                      value={selectedMilestone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMilestone(val);
                        if (val !== 'Custom Event Name') {
                          setCountdownEventName(val);
                        }
                      }}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs text-white outline-none focus:border-[#d4af37]"
                    >
                      <option value="Audition Countdown">Audition Countdown</option>
                      <option value="Voter Registration Day">Voter Registration Day</option>
                      <option value="Grand Auditions">Grand Auditions</option>
                      <option value="Elimination Round">Elimination Round</option>
                      <option value="Semifinals">Semifinals</option>
                      <option value="Grand Finale">Grand Finale</option>
                      <option value="Custom Event Name">Custom Event Name</option>
                    </select>
                  </div>

                  {selectedMilestone === 'Custom Event Name' && (
                    <div className="animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1.5 font-mono">Custom Event Label</label>
                      <input 
                        type="text" 
                        value={countdownEventName}
                        onChange={(e) => setCountdownEventName(e.target.value)}
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-xs text-white outline-none focus:border-[#d4af37]" 
                        placeholder="e.g. Special Audition Launch"
                      />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-text-sub leading-normal pt-2 border-t border-[#262626]">Provides a customizable name displayed as the main title header on the dynamic countdown layout.</p>
              </div>
            </div>
          </div>

          {/* Phase 4: System State Controls */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="border-b border-[#262626] pb-4 text-left">
               <h2 className="text-xl font-bold text-white font-sans">System Controls & State Toggles</h2>
               <p className="text-xs text-[#A3A3A3] mt-1 font-sans">Configure the core operational states and features of the Next Billionaire Path platform.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              
              {/* Registration Toggle */}
              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1 font-mono">Registration Status</span>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${regOpen ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {regOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed mb-4">When open, the website renders the registration form wizard. When closed, it blocks new form submissions.</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Registration Open</span>
                  <button 
                    onClick={() => setRegOpen(!regOpen)}
                    type="button"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${regOpen ? 'bg-[#d4af37]' : 'bg-neutral-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${regOpen ? 'translate-x-5 bg-black' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Voting Toggle */}
              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1 font-mono">Voting Engine</span>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${votingOn ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {votingOn ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed mb-4">When enabled, users are prompted to buy/cast votes for contestants. Changes the homepage Hero Right card to active voting status.</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Voting Active</span>
                  <button 
                    onClick={() => setVotingOn(!votingOn)}
                    type="button"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${votingOn ? 'bg-[#d4af37]' : 'bg-neutral-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${votingOn ? 'translate-x-5 bg-black' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Video Upload Visibility */}
              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1 font-mono">Audition Video Upload</span>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${videoUploadVisible ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {videoUploadVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed mb-4">Toggle whether the video upload field is visible in the registration flow. Let contestants link or produce videos directly.</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Show Video Upload</span>
                  <button 
                    onClick={() => {
                      const nextVal = !videoUploadVisible;
                      setVideoUploadVisible(nextVal);
                      if (!nextVal) {
                        setVideoRequired(false);
                      }
                    }}
                    type="button"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${videoUploadVisible ? 'bg-[#d4af37]' : 'bg-neutral-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${videoUploadVisible ? 'translate-x-5 bg-black' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Video Requirement Toggle */}
              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1 font-mono">Video Requirement Status</span>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${videoRequired ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                      {videoRequired ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed mb-4">Set whether an audition video file is strictly mandatory to submit the registration form. (Only applies if visible.)</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Mandatory Videos</span>
                  <button 
                    disabled={!videoUploadVisible}
                    onClick={() => {
                      if (!videoUploadVisible) return;
                      setVideoRequired(!videoRequired);
                    }}
                    type="button"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${!videoUploadVisible ? 'opacity-40 cursor-not-allowed bg-zinc-800' : videoRequired ? 'bg-[#d4af37]' : 'bg-neutral-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${!videoUploadVisible ? 'translate-x-0 bg-zinc-650' : videoRequired ? 'translate-x-5 bg-black' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Remove Registration toggle for Advertising Board state */}
              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col justify-between sm:col-span-2">
                <div>
                  <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1 font-mono">Remove Registration Form / Promotional Board</span>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${removeRegForm ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`}>
                      {removeRegForm ? 'Advertising Board ON' : 'Default Flow ON'}
                    </span>
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed mb-4">
                    When enabled, both the Registration Form and "Registration Closed" fallback card are completely removed from the Homepage Hero Section, transforming that space into a fully functional and highly stylized partner/sponsor **Advertising Board**.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Remove Registration & Show Ad Board</span>
                  <button 
                    onClick={() => setRemoveRegForm(!removeRegForm)}
                    type="button"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${removeRegForm ? 'bg-[#d4af37]' : 'bg-neutral-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${removeRegForm ? 'translate-x-5 bg-black' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {removeRegForm && (
                <div className="bg-bg border border-dashed border-[#d4af37]/30 rounded-xl p-6 sm:col-span-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                    📢 Configure Advertising Flyer & Promotion Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Promotion Headline / Title</label>
                      <input 
                        type="text" 
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-white outline-none focus:border-[#d4af37]" 
                        placeholder="e.g. Global Pitch Competition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Target Action URL / Redirect Link</label>
                      <input 
                        type="text" 
                        value={adLinkUrl}
                        onChange={(e) => setAdLinkUrl(e.target.value)}
                        className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-white outline-none focus:border-[#d4af37]" 
                        placeholder="e.g. /about or external link"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Flyer / Poster Image URL (Cloudinary URL or external link)</label>
                    <input 
                      type="text" 
                      value={adImageUrl}
                      onChange={(e) => setAdImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-white outline-none focus:border-[#d4af37] font-mono" 
                      placeholder="e.g. https://res.cloudinary.com/..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1.5">Promotional Copy / Descriptions</label>
                    <textarea 
                      value={adText}
                      onChange={(e) => setAdText(e.target.value)}
                      className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-white outline-none focus:border-[#d4af37] min-h-[80px]" 
                      placeholder="Enter description/copy advert detail..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#d4af37] disabled:opacity-50 text-black font-extrabold uppercase text-xs tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(212,175,55,0.25)] cursor-pointer"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isSaving ? 'Saving' : 'Save Platform Configuration'}
            </button>
          </div>
        </div>

        <div className="space-y-6 text-left">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white border-b border-[#262626] pb-3 mb-4">Manage Sponsors</h2>
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
              {sponsors.map(sponsor => (
                <div key={sponsor.id} className="flex items-center justify-between bg-bg border border-border p-3 rounded-lg group">
                   <div className="flex flex-col text-left">
                     <span className="text-white font-bold text-sm tracking-wide">{sponsor.name}</span>
                     <span className="text-[#A3A3A3] text-[10px] uppercase tracking-widest">{sponsor.logo_type}</span>
                   </div>
                   <button 
                     onClick={() => removeSponsor(sponsor.id)}
                     className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-red-500/10 rounded cursor-pointer"
                   >
                     Remove
                   </button>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-[#262626] text-left">
              <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider block mb-2">Quick Add Sponsor (Name)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm outline-none focus:border-[#d4af37] text-white" 
                  placeholder="e.g. Acme Corp" 
                />
                <button 
                  onClick={handleAddSponsor}
                  className="px-4 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:opacity-90 flex-shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 text-amber-500 font-bold mb-4">
              <ShieldAlert size={20} />
              Danger Zone
            </div>
            <p className="text-sm text-amber-200 leading-relaxed mb-6">
              Executing logic here will irreversibly destroy or modify core structures of the Next Billionaire Path.
            </p>
            <div className="space-y-3">
               <button className="w-full px-4 py-3 bg-neutral-900 border border-amber-500/30 text-amber-400 font-bold text-sm rounded-xl text-center hover:bg-neutral-800 transition-colors cursor-pointer">
                 Reset All Votes to Zero
               </button>
               <button className="w-full px-4 py-3 bg-red-950/40 border border-red-500/40 text-red-400 font-bold text-sm rounded-xl text-center hover:bg-red-900/30 transition-colors cursor-pointer shadow-md">
                 Erase Participant Database
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
