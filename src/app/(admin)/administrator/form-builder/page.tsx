'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Save, 
  CheckSquare, 
  Square, 
  Eye, 
  Layers, 
  X, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { FormStep, FormField } from '@/config/systemConfig';
import { DEFAULT_FORM_STEPS } from '@/data/staticContent';
import { getFormFieldsAction, saveFormFieldsAction } from '@/features/form-builder/actions';

export default function AdminFormBuilderPage() {
  const [steps, setSteps] = useState<FormStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Modal Editing States
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStepNumber, setSelectedStepNumber] = useState<number>(1);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Field Form States
  const [fieldId, setFieldId] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<FormField['type']>('text');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldRequired, setFieldRequired] = useState(true);
  const [fieldIsEnabled, setFieldIsEnabled] = useState(true);
  const [fieldOptionsRaw, setFieldOptionsRaw] = useState('');

  // Active step for visual preview
  const [previewStep, setPreviewStep] = useState<number>(1);

  useEffect(() => {
    async function loadDbSchema() {
      try {
        const schema = await getFormFieldsAction(true);
        setSteps(schema);
        if (schema.length > 0) {
          setPreviewStep(schema[0].number);
        }
      } catch (err: any) {
        console.error('[AdminFormBuilder] Error resolving dynamic settings:', err);
        setSteps(DEFAULT_FORM_STEPS as FormStep[]);
        setPreviewStep((DEFAULT_FORM_STEPS as FormStep[])[0].number);
      } finally {
        setLoading(false);
      }
    }
    loadDbSchema();
  }, []);

  const handleSave = async (updatedSteps = steps) => {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await saveFormFieldsAction(updatedSteps);
      if (response.success) {
        setFeedback({ type: 'success', message: response.message });
        setSteps(updatedSteps);
      } else {
        setFeedback({ type: 'error', message: response.message });
      }
    } catch (err: any) {
      console.error('[AdminFormBuilder] Save exceptional error:', err);
      setFeedback({ type: 'error', message: err.message || 'Transaction portal connection lost.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const confirmReset = window.confirm('Are you sure you want to reset all dynamic fields to default system seed configurations? This will erase custom additions.');
    if (!confirmReset) return;

    const DEFAULT_FORM_STEPS_RESETS = [
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
    ] as unknown as FormStep[];

    await handleSave(DEFAULT_FORM_STEPS_RESETS);
  };

  const openAddField = (stepNum: number) => {
    setModalMode('add');
    setSelectedStepNumber(stepNum);
    setFieldId('');
    setFieldLabel('');
    setFieldType('text');
    setFieldPlaceholder('');
    setFieldRequired(true);
    setFieldIsEnabled(true);
    setFieldOptionsRaw('');
    setEditingFieldId(null);
    setShowFieldModal(true);
  };

  const openEditField = (stepNum: number, field: FormField) => {
    setModalMode('edit');
    setSelectedStepNumber(stepNum);
    setFieldId(field.id);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldPlaceholder(field.placeholder || '');
    setFieldRequired(field.required);
    setFieldIsEnabled((field as any).is_enabled !== false);
    setFieldOptionsRaw(field.options ? field.options.join(', ') : '');
    setEditingFieldId(field.id);
    setShowFieldModal(true);
  };

  const handleDeleteField = (stepNum: number, fId: string) => {
    const confirmDel = window.confirm('Delete this field? Raw submissions containing this field identifier will not be deleted but won\'t collect new answers.');
    if (!confirmDel) return;

    const updated = steps.map(step => {
      if (step.number === stepNum) {
        return {
          ...step,
          fields: step.fields.filter(f => f.id !== fId)
        };
      }
      return step;
    });
    setSteps(updated);
    setFeedback({ type: 'success', message: 'Field deleted draft. Remember to click "Save Form Schema" to persist.' });
  };

  const moveFieldUp = (stepNum: number, index: number) => {
    if (index === 0) return;
    const updated = steps.map(step => {
      if (step.number === stepNum) {
        const newFields = [...step.fields];
        const temp = newFields[index - 1];
        newFields[index - 1] = newFields[index];
        newFields[index] = temp;
        return { ...step, fields: newFields };
      }
      return step;
    });
    setSteps(updated);
  };

  const moveFieldDown = (stepNum: number, index: number) => {
    const step = steps.find(s => s.number === stepNum);
    if (!step || index === step.fields.length - 1) return;
    const updated = steps.map(s => {
      if (s.number === stepNum) {
        const newFields = [...s.fields];
        const temp = newFields[index + 1];
        newFields[index + 1] = newFields[index];
        newFields[index] = temp;
        return { ...s, fields: newFields };
      }
      return s;
    });
    setSteps(updated);
  };

  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim()) return;

    const finalId = fieldId.trim() || fieldLabel.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const parsedOptions = fieldType === 'select'
      ? fieldOptionsRaw.split(',').map(o => o.trim()).filter(o => o.length > 0)
      : undefined;

    const newField: FormField = {
      id: finalId,
      label: fieldLabel.trim(),
      type: fieldType,
      placeholder: fieldPlaceholder.trim() || undefined,
      required: fieldRequired,
      options: parsedOptions,
      is_enabled: fieldIsEnabled,
    } as any;

    const updated = steps.map(step => {
      if (step.number === selectedStepNumber) {
        if (modalMode === 'edit' && editingFieldId) {
          return {
            ...step,
            fields: step.fields.map(f => f.id === editingFieldId ? newField : f)
          };
        } else {
          if (step.fields.some(f => f.id === finalId)) {
            alert('A field with identifier keyword "' + finalId + '" already exists in this step. Please choose another.');
            return step;
          }
          return {
            ...step,
            fields: [...step.fields, newField]
          };
        }
      }
      return step;
    });

    setSteps(updated);
    setShowFieldModal(false);
    setFeedback({ type: 'success', message: `Field "${fieldLabel}" successfully ${modalMode === 'add' ? 'added as draft' : 'updated as draft'}. Click "Save Form Schema" to write to server.` });
  };

  const handleAddStep = () => {
    const nextNum = steps.length > 0 ? Math.max(...steps.map(s => s.number)) + 1 : 1;
    const title = window.prompt("Enter step title:", `Step ${nextNum} Context`);
    if (!title || !title.trim()) return;

    const newStep: FormStep = {
      number: nextNum,
      title: title.trim(),
      fields: []
    };
    setSteps([...steps, newStep]);
    setFeedback({ type: 'success', message: 'New step section added. Add fields to populate.' });
  };

  const handleDeleteStep = (stepNum: number) => {
    const confirmDel = window.confirm('Erase this entire multi-step column and all its assigned input fields permanently from drafts?');
    if (!confirmDel) return;

    const filtered = steps.filter(s => s.number !== stepNum);
    const renumbered = filtered.map((s, idx) => ({
      ...s,
      number: idx + 1
    }));
    setSteps(renumbered);
    if (!renumbered.some(s => s.number === previewStep) && renumbered.length > 0) {
      setPreviewStep(renumbered[0].number);
    }
    setFeedback({ type: 'success', message: 'Step column and fields cleared.' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-text-sub text-sm font-bold uppercase tracking-wider mb-1">Registration Config</p>
          <h1 className="text-3xl font-black text-text-main tracking-tight font-sans">Dynamic Form Builder</h1>
          <p className="text-xs text-text-sub mt-1 max-w-xl leading-relaxed">
            Customize the onboarding form sections and input fields live on the site. Change requirements, step flows, or insert visual audition elements.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 self-start sm:self-center">
          <button 
            type="button" 
            onClick={handleResetToDefault}
            className="flex items-center gap-2 px-4 py-3 bg-[#101622] border border-[#232B3A] text-[#A3A3A3] hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Reset Default
          </button>
          <button 
            type="button" 
            disabled={saving}
            onClick={() => handleSave(steps)}
            className="flex items-center gap-2 px-5 py-3 bg-[#d4af37] hover:opacity-90 disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-opacity shadow-[0_4px_20px_rgba(212,175,55,0.25)] cursor-pointer"
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save Form Schema'}
          </button>
        </div>
      </header>

      {/* RECENT FEEDBACK ALERTS */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${feedback.type === 'success' ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'}`}>
          <AlertCircle size={18} />
          <p className="text-xs uppercase font-extrabold tracking-wider">{feedback.message}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl">
          <RefreshCw size={32} className="animate-spin text-[#d4af37] mx-auto mb-4 w-8 h-8" />
          <p className="text-xs font-bold text-text-sub uppercase tracking-wider">Syncing database form fields schemas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* STEP MANAGER SECTION */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            
            {steps.length === 0 ? (
              <div className="p-8 text-center bg-card border-2 border-dashed border-border rounded-2xl">
                <Layers size={36} className="text-[#A3A3A3] mx-auto mb-3 w-9 h-9" />
                <h3 className="text-lg font-bold text-white mb-1">No Active Form Steps</h3>
                <p className="text-xs text-text-sub max-w-sm mx-auto mb-4">You have deleted all active form chapters. Create a customized step wizard from scratch.</p>
                <button 
                  onClick={handleAddStep}
                  className="px-4 py-2.5 bg-[#d4af37] text-black text-xs font-extrabold uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create First Step
                </button>
              </div>
            ) : (
              steps.map((step) => (
                <div key={step.number} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  
                  {/* Step Banner Header */}
                  <div className="bg-[#101622] px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-black text-xs font-mono shrink-0">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="font-sans font-black text-white text-base tracking-tight leading-none">
                          {step.title}
                        </h3>
                        <p className="text-[10px] text-text-sub uppercase tracking-widest mt-1 font-semibold">
                          Contains {step.fields.length} dynamic custom fields
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openAddField(step.number)}
                        className="px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/20 hover:bg-[#d4af37] hover:text-black hover:border-transparent rounded-lg text-[#d4af37] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={12} className="stroke-[3px]" /> Add Field
                      </button>
                      <button 
                        onClick={() => handleDeleteStep(step.number)}
                        className="p-1 px-2 hover:bg-red-500/15 text-red-500/80 hover:text-red-400 border border-transparent hover:border-red-500/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        Delete Step
                      </button>
                    </div>
                  </div>

                  {/* Fields List Container */}
                  <div className="p-4 sm:p-6 divide-y divide-[#232B3A]/40">
                    {step.fields.length === 0 ? (
                      <div className="py-8 text-center bg-black/20 rounded-xl">
                        <p className="text-xs italic text-text-sub">No fields assigned to this step yet. Hit "Add Field" to create your first input criteria.</p>
                      </div>
                    ) : (
                      step.fields.map((field, index) => (
                        <div key={field.id} className={`py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${(field as any).is_enabled === false ? 'opacity-60' : ''}`}>
                          
                          {/* Field Information Block */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-white font-bold text-sm tracking-wide">{field.label}</span>
                              <span className="text-[9px] font-mono uppercase bg-[#141B26] text-text-sub border border-[#232B3A] px-1.5 py-0.5 rounded font-black tracking-widest truncate max-w-[200px]">
                                ID: {field.id}
                              </span>
                              <span className="text-[9px] font-sans font-black uppercase bg-[#d4af37]/10 text-[#d4af37] px-1.5 py-0.5 rounded tracking-widest">
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="text-[9px] font-sans font-black uppercase bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded tracking-widest animate-pulse">
                                  REQUIRED
                                </span>
                              )}
                              {(field as any).is_enabled === false && (
                                <span className="text-[9px] font-sans font-black uppercase bg-neutral-500/10 text-neutral-400 px-1.5 py-0.5 rounded tracking-widest">
                                  DISABLED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-sub italic">
                              {field.placeholder ? `Placeholder: "${field.placeholder}"` : 'No placeholder set'}
                            </p>
                            {field.options && field.options.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-text-sub font-mono uppercase font-black shrink-0">Dropdown Selection:</span>
                                <div className="flex flex-wrap gap-1">
                                  {field.options.map(opt => (
                                    <span key={opt} className="text-[10px] bg-[#141B26] border border-[#232B3A] px-1 rounded-md text-white font-medium">{opt}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Order & Modification Controls */}
                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                            
                            {/* Sorting Buttons */}
                            <button 
                              onClick={() => moveFieldUp(step.number, index)}
                              disabled={index === 0}
                              className="p-2 text-[#A3A3A3] hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-20 transition-all border border-transparent hover:border-[#232B3A] cursor-pointer"
                              title="Move field up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button 
                              onClick={() => moveFieldDown(step.number, index)}
                              disabled={index === step.fields.length - 1}
                              className="p-2 text-[#A3A3A3] hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-20 transition-all border border-transparent hover:border-[#232B3A] cursor-pointer"
                              title="Move field down"
                            >
                              <ArrowDown size={14} />
                            </button>

                            {/* Action Buttons */}
                            <button 
                              onClick={() => openEditField(step.number, field)}
                              className="p-2 text-[#A3A3A3] hover:text-[#d4af37] border border-transparent hover:border-[#d4af37]/10 hover:bg-[#d4af37]/5 rounded-lg transition-all ml-1 cursor-pointer"
                              title="Edit specifications"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteField(step.number, field.id)}
                              className="p-2 text-[#A3A3A3] hover:text-red-500 border border-transparent hover:border-red-500/10 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer"
                              title="Remove input field"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              ))
            )}

            {/* Quick Step Addition Button */}
            <div className="pt-2">
              <button 
                onClick={handleAddStep}
                className="w-full py-4 border-2 border-dashed border-[#232B3A] hover:border-[#d4af37] hover:bg-[#d4af37]/5 rounded-2xl flex items-center justify-center gap-2 text-[#A3A3A3] hover:text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                <Plus size={16} /> Add New Step Column Segment
              </button>
            </div>

          </div>

          {/* SIDEBAR PREVIEW SECTION */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
            
            <div className="bg-card border border-border rounded-2xl p-6 relative">
              
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                <Eye size={18} className="text-[#d4af37]" />
                <h2 className="text-base font-sans font-black text-white tracking-wide">Dynamic Form Preview</h2>
              </div>

              {steps.length === 0 ? (
                <p className="text-xs italic text-text-sub text-center py-6">No active fields to render. Add fields to active steps to inspect elements.</p>
              ) : (
                <div className="space-y-4 text-left">
                  
                  {/* Step Selector Slider */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#232B3A]/30">
                    {steps.map(s => (
                      <button 
                        key={s.number}
                        onClick={() => setPreviewStep(s.number)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${previewStep === s.number ? 'bg-[#d4af37] text-black font-extrabold' : 'bg-[#101622] text-[#A3A3A3] border border-[#232B3A]/40 hover:text-white'}`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>

                  {/* Render Mock Input Field Blocks */}
                  <div className="bg-[#101622] p-5 border border-[#232B3A]/40 rounded-xl space-y-4">
                    <p className="text-[10px] font-mono font-black uppercase text-[#d4af37] tracking-widest">
                      Live Preview &bull; {steps.find(s => s.number === previewStep)?.title}
                    </p>

                    <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1">
                      {steps.find(s => s.number === previewStep)?.fields.map(field => (
                        <div key={field.id} className="space-y-1.5 text-left">
                          <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest flex items-center gap-1 font-mono">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>

                          {field.type === 'textarea' ? (
                            <textarea 
                              disabled 
                              placeholder={field.placeholder || "Disabled field preview template"}
                              className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none resize-none h-16 cursor-not-allowed opacity-75"
                            />
                          ) : field.type === 'select' ? (
                            <select 
                              disabled
                              className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-not-allowed opacity-75 h-9"
                            >
                              <option>-- Select dropdown option template --</option>
                              {field.options?.map(o => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          ) : field.type === 'video' ? (
                            <div className="bg-neutral-900 border border-[#232B3A] cursor-not-allowed border-dashed rounded-xl p-4 text-center text-text-sub text-xs opacity-75">
                              [ Dynamic Video Audition Input Criteria ]
                            </div>
                          ) : (
                            <input 
                              type={field.type} 
                              disabled 
                              placeholder={field.placeholder || "Disabled field preview template"}
                              className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none cursor-not-allowed opacity-75 h-9"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#232B3A]/40 flex justify-end">
                      <button disabled className="px-4 py-2 bg-[#d4af37] text-black font-black text-[10px] uppercase tracking-widest rounded-lg opacity-40 cursor-not-allowed">
                        Next Step Segment &rarr;
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* FORM BUILDER FIELD CREATION/MUTATION MODAL */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black/80 z-[200] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101622] rounded-3xl border border-[#232B3A] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#141B26] border-b border-[#232B3A]/40 flex items-center justify-between">
              <h3 className="font-sans font-black text-white text-base tracking-tight">
                {modalMode === 'add' ? 'Add Input Field Criterion' : 'Modify Input Field Criterion'}
              </h3>
              <button 
                onClick={() => setShowFieldModal(false)}
                className="text-[#A3A3A3] hover:text-white bg-transparent border-0 outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFieldSubmit} className="p-6 space-y-4">
              
              {/* Field Label */}
              <div>
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block mb-1.5 font-mono">
                  Input Label / Query Question
                </label>
                <input 
                  type="text" 
                  required
                  value={fieldLabel}
                  onChange={(e) => {
                    setFieldLabel(e.target.value);
                    if (modalMode === 'add') {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                      setFieldId(slug);
                    }
                  }}
                  className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#d4af37]"
                  placeholder="e.g. Years of Operating Business"
                />
              </div>

              {/* Field ID (For metadata JSON key) */}
              <div>
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block mb-1.5 font-mono">
                  Database Column Identifier Key (Unique Slug ID)
                </label>
                <input 
                  type="text" 
                  required
                  disabled={modalMode === 'edit'}
                  value={fieldId}
                  onChange={(e) => setFieldId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  placeholder="e.g. business_experience_years"
                />
                {modalMode === 'add' && (
                  <p className="text-[9px] text-[#A3A3A3] italic mt-1 font-mono">
                    This must be a clean, unique alphanumeric identifier without spaces (e.g. "email", "student_status").
                  </p>
                )}
              </div>

              {/* Field Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block mb-1.5 font-mono">
                    Input Control Type
                  </label>
                  <select 
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as FormField['type'])}
                    className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#d4af37]"
                  >
                    <option value="text">Text (Single Line)</option>
                    <option value="textarea">Textarea (Paragraph Box)</option>
                    <option value="number">Number Slider/Input</option>
                    <option value="tel">Telephone / Phone</option>
                    <option value="email">Email Verified</option>
                    <option value="date">Date picker</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="video">Audition / Media Upload</option>
                  </select>
                </div>

                {/* Assignment Step */}
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block mb-1.5 font-mono">
                    Assign Step Chapter
                  </label>
                  <select 
                    value={selectedStepNumber}
                    onChange={(e) => setSelectedStepNumber(Number(e.target.value))}
                    className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#d4af37]"
                  >
                    {steps.map(s => (
                      <option key={s.number} value={s.number}>
                        Step {s.number}: {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specific for 'select' type (Options) */}
              {fieldType === 'select' && (
                <div className="animate-in slide-in-from-top-1 text-left">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block mb-1.5 font-mono">
                    Dropdown Options (Separate with Commas)
                  </label>
                  <input 
                    type="text" 
                    required={fieldType === 'select'}
                    value={fieldOptionsRaw}
                    onChange={(e) => setFieldOptionsRaw(e.target.value)}
                    className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#d4af37]"
                    placeholder="e.g. Startup, Micro, Enterprise"
                  />
                  <p className="text-[9px] text-[#A3A3A3] italic mt-1 font-sans font-medium">
                    Provide the selection options separated strictly by commas.
                  </p>
                </div>
              )}

              {/* Placeholder text inputs */}
              {fieldType !== 'select' && fieldType !== 'video' && (
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest block mb-1.5 font-mono">
                    Input Placeholder Guidance
                  </label>
                  <input 
                    type="text" 
                    value={fieldPlaceholder}
                    onChange={(e) => setFieldPlaceholder(e.target.value)}
                    className="w-full bg-[#141B26] border border-[#232B3A] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#d4af37]"
                    placeholder="e.g. Choose age or type experience context"
                  />
                </div>
              )}

              {/* Validation - Required checkbox toggle */}
              <div className="flex items-center justify-between p-4 bg-background/50 border border-[#232B3A]/40 rounded-xl">
                <div className="text-left">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Required Field Criteria</p>
                  <p className="text-[10px] text-text-sub leading-none mt-1">If enabled, registration cannot proceed without this criteria answered.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFieldRequired(!fieldRequired)}
                  className="p-1 text-[#d4af37] bg-transparent hover:bg-white/5 rounded-lg border border-transparent cursor-pointer"
                >
                  {fieldRequired ? (
                    <CheckSquare size={22} className="stroke-[2.5]" />
                  ) : (
                    <Square size={22} className="text-[#A3A3A3]" />
                  )}
                </button>
              </div>

              {/* Validation - Enabled checkbox toggle */}
              <div className="flex items-center justify-between p-4 bg-background/50 border border-[#232B3A]/40 rounded-xl">
                <div className="text-left">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Enabled Field Status</p>
                  <p className="text-[10px] text-text-sub leading-none mt-1">If deactivated, this field will be hidden from the active registration form.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFieldIsEnabled(!fieldIsEnabled)}
                  className="p-1 text-[#d4af37] bg-transparent hover:bg-white/5 rounded-lg border border-transparent cursor-pointer"
                >
                  {fieldIsEnabled ? (
                    <CheckSquare size={22} className="stroke-[2.5]" />
                  ) : (
                    <Square size={22} className="text-[#A3A3A3]" />
                  )}
                </button>
              </div>

              {/* Modal footer submit */}
              <div className="pt-4 border-t border-[#232B3A]/40 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-4 py-2.5 bg-[#141B26] border border-[#232B3A] text-[#A3A3A3] hover:text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest rounded-xl transition-opacity hover:opacity-90 flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Check size={14} className="stroke-[3px]" /> Confirm Criteria
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
