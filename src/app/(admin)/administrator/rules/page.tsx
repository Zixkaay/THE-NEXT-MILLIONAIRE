'use client';

import React, { useState, useEffect } from 'react';
import { 
  getWeeklyRulesAction, 
  createWeeklyRuleAction, 
  updateWeeklyRuleAction, 
  deleteWeeklyRuleAction,
  getGeneralRulesAction,
  createGeneralRuleAction,
  updateGeneralRuleAction,
  deleteGeneralRuleAction,
  getTermsAndConditionsAction,
  updateTermsAndConditionsAction 
} from '@/features/rules/actions/rules';
import { DatabaseWeeklyRule, DatabaseGeneralRule } from '@/types/database';
import { Loader2, Plus, Edit2, Trash2, Save, Sparkles, Check, HelpCircle, ShieldAlert, X } from 'lucide-react';

export default function AdminRulesPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'general' | 'terms'>('weekly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data states
  const [weeklyRules, setWeeklyRules] = useState<DatabaseWeeklyRule[]>([]);
  const [generalRules, setGeneralRules] = useState<DatabaseGeneralRule[]>([]);
  const [termsMarkdown, setTermsMarkdown] = useState('');

  // Dialog & form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<'weekly' | 'general'>('weekly');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [wTitle, setWTitle] = useState('');
  const [wDescription, setWDescription] = useState('');
  const [wNumber, setWNumber] = useState(1);
  const [wActive, setWActive] = useState(false);

  const [gTitle, setGTitle] = useState('');
  const [gContent, setGContent] = useState('');
  const [gOrder, setGOrder] = useState(1);

  async function loadAllData() {
    setLoading(true);
    try {
      const [weeks, globals, terms] = await Promise.all([
        getWeeklyRulesAction(),
        getGeneralRulesAction(),
        getTermsAndConditionsAction()
      ]);
      setWeeklyRules(weeks);
      setGeneralRules(globals);
      setTermsMarkdown(terms);
    } catch (err) {
      console.error('Failed to load rules state:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Weekly rule actions
  const handleOpenWeeklyNew = () => {
    setEditingType('weekly');
    setEditingId(null);
    setWTitle('');
    setWDescription('');
    setWNumber(weeklyRules.length + 1);
    setWActive(false);
    setModalOpen(true);
  };

  const handleOpenWeeklyEdit = (rule: DatabaseWeeklyRule) => {
    setEditingType('weekly');
    setEditingId(rule.id);
    setWTitle(rule.title);
    setWDescription(rule.description || '');
    setWNumber(rule.week_number);
    setWActive(!!rule.is_active);
    setModalOpen(true);
  };

  const handleSaveWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wTitle.trim() || !wDescription.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: wTitle.trim(),
        description: wDescription.trim(),
        week_number: Number(wNumber),
        is_active: wActive
      };

      if (editingId) {
        const res = await updateWeeklyRuleAction(editingId, payload);
        if (res.success) {
          showToast('success', 'Weekly evaluation rule updated successfully.');
          setModalOpen(false);
          loadAllData();
        } else {
          showToast('error', res.message || 'Failed to update weekly rule.');
        }
      } else {
        const res = await createWeeklyRuleAction(payload);
        if (res.success) {
          showToast('success', 'New weekly evaluation rule cataloged.');
          setModalOpen(false);
          loadAllData();
        } else {
          showToast('error', res.message || 'Failed to create weekly rule.');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'Server exception.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWeekly = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weekly rule?')) return;
    try {
      const res = await deleteWeeklyRuleAction(id);
      if (res.success) {
        showToast('success', 'Weekly rule permanently purged.');
        loadAllData();
      } else {
        showToast('error', res.message || 'Purging failed.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Server error.');
    }
  };

  // General rule actions
  const handleOpenGeneralNew = () => {
    setEditingType('general');
    setEditingId(null);
    setGTitle('');
    setGContent('');
    setGOrder(generalRules.length + 1);
    setModalOpen(true);
  };

  const handleOpenGeneralEdit = (rule: DatabaseGeneralRule) => {
    setEditingType('general');
    setEditingId(rule.id);
    setGTitle(rule.title);
    setGContent(rule.content || '');
    setGOrder(rule.sort_order);
    setModalOpen(true);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gTitle.trim() || !gContent.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: gTitle.trim(),
        content: gContent.trim(),
        sort_order: Number(gOrder)
      };

      if (editingId) {
        const res = await updateGeneralRuleAction(editingId, payload);
        if (res.success) {
          showToast('success', 'General instruction updated.');
          setModalOpen(false);
          loadAllData();
        } else {
          showToast('error', res.message || 'Failed to save.');
        }
      } else {
        const res = await createGeneralRuleAction(payload);
        if (res.success) {
          showToast('success', 'General instruction cataloged.');
          setModalOpen(false);
          loadAllData();
        } else {
          showToast('error', res.message || 'Failed to insert.');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'Server exception.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGeneral = async (id: string) => {
    if (!confirm('Are you sure you want to delete this general rule?')) return;
    try {
      const res = await deleteGeneralRuleAction(id);
      if (res.success) {
        showToast('success', 'General instruction purged.');
        loadAllData();
      } else {
        showToast('error', res.message || 'Failed to delete general rule.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Exception.');
    }
  };

  // Terms & Conditions actions
  const handleSaveTermsAndConditions = async () => {
    setSaving(true);
    try {
      const res = await updateTermsAndConditionsAction(termsMarkdown);
      if (res.success) {
        showToast('success', 'Terms & conditions document written successfully.');
      } else {
        showToast('error', res.message || 'Failed to update document.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Server error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#d4af37] mb-4" size={32} />
        <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest leading-none">Loading Admin Rules Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[#A3A3A3] text-xs font-bold uppercase tracking-widest mb-1">Central Console</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Rules & Terms CMS</h1>
        </div>
        {toast && (
          <div className={`p-3 px-4 rounded-xl text-xs font-bold ${toast.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {toast.message}
          </div>
        )}
      </header>

      {/* Tabs navigation */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 -mb-px ${activeTab === 'weekly' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-[#a3a3a3] hover:text-white'}`}
        >
          Weekly Chapters Rules
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 -mb-px ${activeTab === 'general' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-[#a3a3a3] hover:text-white'}`}
        >
          General Regulations
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 -mb-px ${activeTab === 'terms' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-[#a3a3a3] hover:text-white'}`}
        >
          Terms Document (ToS)
        </button>
      </div>

      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0a0a0a] p-4 border border-[#262626] rounded-2xl">
            <p className="text-xs text-[#a3a3a3] font-medium">Configure weeks progression parameters dynamically below.</p>
            <button
              onClick={handleOpenWeeklyNew}
              className="bg-[#d4af37] hover:bg-[#b08f24] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-1"
            >
              <Plus size={12} /> Add Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyRules.map((rule) => (
              <div key={rule.id} className="bg-[#050b14] border border-[#262626] rounded-2xl p-5 space-y-4 hover:border-white/15 transition-colors relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37] text-[9px] font-black uppercase tracking-wider border border-[#d4af37]/25">
                      WEEK {rule.week_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${rule.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-700/10 text-gray-500 border border-gray-700/20'}`}>
                      {rule.is_active ? 'Active Week' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-white text-base font-bold tracking-tight">{rule.title}</h3>
                  <p className="text-xs text-text-sub leading-normal">{rule.description}</p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#1a1a1a]">
                  <button
                    onClick={() => handleOpenWeeklyEdit(rule)}
                    className="p-2 bg-[#111] hover:bg-[#222] text-[#A3A3A3] hover:text-white rounded-lg border border-[#262626] transition-colors text-xs flex items-center gap-1 px-3 font-semibold"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteWeekly(rule.id)}
                    className="p-2 bg-red-500/5 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-lg border border-red-500/10 transition-colors text-xs flex items-center gap-1 px-3 font-semibold"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0a0a0a] p-4 border border-[#262626] rounded-2xl">
            <p className="text-xs text-[#a3a3a3] font-medium">Regulations determining candidate standing, authentications, and audits.</p>
            <button
              onClick={handleOpenGeneralNew}
              className="bg-[#d4af37] hover:bg-[#b08f24] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-1"
            >
              <Plus size={12} /> Add Guideline
            </button>
          </div>

          <div className="space-y-3">
            {generalRules.map((rule) => (
              <div key={rule.id} className="bg-[#050b14] border border-[#262626] rounded-2xl p-5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center font-mono text-xs text-[#d4af37] shrink-0 font-bold">
                    {rule.sort_order}
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-bold tracking-tight">{rule.title}</h3>
                    <p className="text-xs text-text-sub mt-1 leading-relaxed">{rule.content}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end self-end md:self-center">
                  <button
                    onClick={() => handleOpenGeneralEdit(rule)}
                    className="p-2 bg-[#111] hover:bg-[#222] text-[#A3A3A3] hover:text-white rounded-lg border border-[#262626] transition-colors text-xs font-semibold flex items-center gap-1 px-3"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGeneral(rule.id)}
                    className="p-2 bg-red-500/5 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-lg border border-red-500/10 transition-colors text-xs font-semibold flex items-center gap-1 px-3"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Dynamic Editorial Markdowns</h3>
                <p className="text-[11px] text-[#a3a3a3] mt-0.5">Edit terms and conditions document displaying globally in real time.</p>
              </div>
              <button
                onClick={handleSaveTermsAndConditions}
                disabled={saving}
                className="bg-[#d4af37] hover:bg-[#b08f24] text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin text-black" size={12} /> : <Save size={12} />}
                Write To Registry
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">RAW MARKDOWN MARKUP Editor</span>
                <textarea
                  rows={20}
                  value={termsMarkdown}
                  onChange={(e) => setTermsMarkdown(e.target.value)}
                  placeholder="Enter Markdown rules..."
                  className="w-full bg-[#050b14] border border-[#262626] rounded-2xl p-4 text-xs font-mono text-white placeholder:text-[#404040] outline-none focus:border-[#d4af37] resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">INTERACTIVE DESKTOP LIVE PREVIEW</span>
                <div className="w-full h-[380px] lg:h-[420px] bg-[#050b14] border border-[#262626] rounded-2xl p-6 overflow-y-auto prose prose-invert max-w-none text-xs text-[#d4af37] space-y-4 font-sans border-dashed">
                  {termsMarkdown.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-lg font-black text-white border-b border-[#262626] pb-2 mt-4">{line.replace('# ', '')}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-xs font-black text-white block uppercase tracking-wider mt-3">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('* ')) {
                      return <li key={idx} className="text-[11px] text-text-sub list-decimal ml-4 pl-1">{line.replace('* ', '')}</li>;
                    }
                    return line.trim() ? <p key={idx} className="text-[11px] text-[#A3A3A3] leading-relaxed">{line}</p> : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#050b14] border border-[#262626] rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                {editingId ? 'Modify Guideline' : 'Incorporate Guideline'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-[#525252] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {editingType === 'weekly' ? (
              <form onSubmit={handleSaveWeekly} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block">Rule Title</label>
                  <input
                    type="text"
                    required
                    value={wTitle}
                    onChange={(e) => setWTitle(e.target.value)}
                    placeholder="E.g. Phase Showcase & Pitches"
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block">Week Number</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={wNumber}
                      onChange={(e) => setWNumber(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block">Active Chapter</label>
                    <button
                      type="button"
                      onClick={() => setWActive(!wActive)}
                      className={`w-full py-3 text-xs font-black rounded-xl border transition-colors ${wActive ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-700/10 text-gray-400 border-gray-700/20'}`}
                    >
                      {wActive ? 'ACTIVATED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block">Description Details</label>
                  <textarea
                    required
                    rows={4}
                    value={wDescription}
                    onChange={(e) => setWDescription(e.target.value)}
                    placeholder="Enter details of candidate milestones for this week..."
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-[#111] text-white border border-[#262626] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-1 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin text-black" size={10} /> : <Save size={10} />}
                    Save Rule
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="grid grid-cols-[1fr_80px] gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block">Regulation Heading</label>
                    <input
                      type="text"
                      required
                      value={gTitle}
                      onChange={(e) => setGTitle(e.target.value)}
                      placeholder="E.g. Disqualification audits details"
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block">Sort Rank</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={gOrder}
                      onChange={(e) => setGOrder(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block">Regulations content parameters</label>
                  <textarea
                    required
                    rows={4}
                    value={gContent}
                    onChange={(e) => setGContent(e.target.value)}
                    placeholder="Provide details about compliance, verification workflows, and policy parameters..."
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-[#111] text-white border border-[#262626] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-1 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin text-black" size={10} /> : <Save size={10} />}
                    Save Guideline
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
