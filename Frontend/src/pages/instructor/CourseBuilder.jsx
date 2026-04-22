import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = ['Development', 'Design', 'Business', 'Marketing', 'Data Science', 'Photography', 'Music', 'Other'];
const ACCESS_TYPES = [
  { value: 'PUBLIC', label: 'Public', icon: '🌍', desc: 'Anyone can find and enroll in this course.' },
  { value: 'PASSWORD_PROTECTED', label: 'Password Protected', icon: '🔒', desc: 'Visible in catalog, but requires an access code to enroll.' },
  { value: 'INVITE_ONLY', label: 'Invite Only', icon: '✉️', desc: 'Hidden from catalog. You add students manually.' },
];

const STEPS = ['Basic Info', 'Access & Pricing', 'Review & Publish'];

const CourseBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Development',
    thumbnailUrl: '',
    price: 0,
    accessType: 'PUBLIC',
    accessCode: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Course title is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        instructorId: user?.id,
        status: 'DRAFT',
      };
      if (form.accessType !== 'PASSWORD_PROTECTED') delete payload.accessCode;
      const res = await axios.post('/api/courses', payload);
      navigate(`/instructor/courses/${res.data.id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Step Panel */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col py-10 px-6 shrink-0">
        <button onClick={() => navigate('/instructor/dashboard')} className="flex items-center gap-2 text-secondary hover:text-primary text-sm font-semibold mb-10 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </button>

        <h1 className="text-2xl font-extrabold text-textMain mb-2">Create Course</h1>
        <p className="text-secondary text-sm mb-10">Fill in the details to publish your course.</p>

        <div className="space-y-2">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${step === i ? 'bg-primary/10' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${i < step ? 'bg-green-500 text-white' : step === i ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-100 text-secondary'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-semibold ${step === i ? 'text-primary' : i < step ? 'text-green-600' : 'text-secondary'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full p-10">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6 text-sm font-medium">{error}</div>}

          {/* ── STEP 1: Basic Info ──────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-textMain mb-1">Basic Information</h2>
                <p className="text-secondary">Tell students what your course is about.</p>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-extrabold text-textMain uppercase tracking-wider mb-3">Course Thumbnail</label>
                <div className="relative w-full h-48 bg-gray-100 rounded-3xl overflow-hidden group border-2 border-dashed border-gray-200 hover:border-primary transition-colors">
                  {form.thumbnailUrl ? (
                    <img src={form.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" onError={() => set('thumbnailUrl', '')} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-secondary">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm font-medium">Enter an image URL below</p>
                    </div>
                  )}
                </div>
                <input type="url" value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} className="input-field mt-3" placeholder="https://images.unsplash.com/..." />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-textMain uppercase tracking-wider mb-2">Course Title *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="input-field text-lg font-semibold" placeholder="e.g. Complete React Developer Course" />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-textMain uppercase tracking-wider mb-2">Subtitle</label>
                <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="input-field" placeholder="A short, catchy description of the course" />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-textMain uppercase tracking-wider mb-2">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} className="input-field resize-none" placeholder="Describe what students will learn, who this course is for, and what topics are covered." />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-textMain uppercase tracking-wider mb-2">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 2: Access & Pricing ────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-textMain mb-1">Access & Pricing</h2>
                <p className="text-secondary">Control who can join and how much it costs.</p>
              </div>

              {/* Access Type */}
              <div>
                <label className="block text-sm font-extrabold text-textMain uppercase tracking-wider mb-3">Access Type</label>
                <div className="space-y-3">
                  {ACCESS_TYPES.map(a => (
                    <label key={a.value} className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${form.accessType === a.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="accessType" value={a.value} checked={form.accessType === a.value} onChange={() => set('accessType', a.value)} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${form.accessType === a.value ? 'border-primary' : 'border-gray-300'}`}>
                        {form.accessType === a.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{a.icon}</span>
                          <span className="font-extrabold text-textMain">{a.label}</span>
                        </div>
                        <p className="text-secondary text-sm">{a.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Access Code */}
              {form.accessType === 'PASSWORD_PROTECTED' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <label className="block text-sm font-extrabold text-amber-800 uppercase tracking-wider mb-2">🔑 Access Code</label>
                  <input type="text" value={form.accessCode} onChange={e => set('accessCode', e.target.value)} className="input-field bg-white" placeholder="e.g. SPRING2025" />
                  <p className="text-amber-700 text-xs mt-2 font-medium">Share this code with students you want to allow.</p>
                </div>
              )}

              {/* Price */}
              <div>
                <label className="block text-sm font-extrabold text-textMain uppercase tracking-wider mb-2">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-lg">$</span>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className="input-field pl-8 text-lg font-bold" />
                </div>
                {parseFloat(form.price) === 0 && <p className="text-green-600 text-xs mt-2 font-semibold">✓ This course will be free for students.</p>}
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-textMain mb-1">Review & Publish</h2>
                <p className="text-secondary">Confirm your course details before publishing.</p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="thumbnail" className="w-full h-48 object-cover" onError={() => {}} />}
                <div className="p-8 space-y-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-secondary mb-1">Title</p>
                    <p className="text-xl font-extrabold text-textMain">{form.title || '(untitled)'}</p>
                  </div>
                  {form.subtitle && <div><p className="text-xs font-extrabold uppercase tracking-widest text-secondary mb-1">Subtitle</p><p className="text-textMain">{form.subtitle}</p></div>}
                  {form.description && <div><p className="text-xs font-extrabold uppercase tracking-widest text-secondary mb-1">Description</p><p className="text-secondary text-sm leading-relaxed">{form.description}</p></div>}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center"><p className="text-xs text-secondary font-bold uppercase mb-1">Category</p><p className="font-extrabold text-textMain text-sm">{form.category}</p></div>
                    <div className="text-center"><p className="text-xs text-secondary font-bold uppercase mb-1">Access</p><p className="font-extrabold text-textMain text-sm">{ACCESS_TYPES.find(a => a.value === form.accessType)?.icon} {form.accessType.replace('_', ' ')}</p></div>
                    <div className="text-center"><p className="text-xs text-secondary font-bold uppercase mb-1">Price</p><p className="font-extrabold text-primary text-sm">{parseFloat(form.price) === 0 ? 'Free' : `$${form.price}`}</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/instructor/dashboard')} className="btn-secondary">
              {step === 0 ? 'Cancel' : '← Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => { if (step === 0 && !form.title.trim()) { setError('Course title is required.'); return; } setError(''); setStep(s => s + 1); }} className="btn-primary shadow-soft-purple">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary shadow-soft-purple disabled:opacity-60">
                {submitting ? 'Publishing...' : '🚀 Create Course'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
