import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const GradingQueue = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL | PENDING | GRADED

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/assignments/course/${courseId}/submissions`);
        setSubmissions(res.data || []);
      } catch (e) { setSubmissions([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [courseId]);

  const handleGrade = async () => {
    if (!selected || !score) return;
    setGrading(true);
    try {
      await axios.patch(`/api/assignments/submissions/${selected.id}/grade`, {
        grade: parseFloat(score),
        feedback,
        gradedBy: user?.id,
      });
      setSubmissions(prev => prev.map(s => s.id === selected.id ? { ...s, grade: parseFloat(score), feedback, status: 'GRADED' } : s));
      setSelected(prev => ({ ...prev, grade: parseFloat(score), feedback, status: 'GRADED' }));
      setScore('');
      setFeedback('');
    } catch (e) { alert('Grading failed. Please try again.'); }
    finally { setGrading(false); }
  };

  const filtered = submissions.filter(s => filter === 'ALL' ? true : filter === 'PENDING' ? !s.grade : !!s.grade);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Left: Submission List ──────────────────── */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <button onClick={() => navigate('/instructor/dashboard')} className="flex items-center gap-2 text-secondary hover:text-primary text-sm font-semibold mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </button>
          <h2 className="font-extrabold text-textMain text-lg mb-1">Grading Queue</h2>
          <p className="text-xs text-secondary">{submissions.filter(s => !s.grade).length} submissions pending</p>
        </div>

        {/* Filter tabs */}
        <div className="px-4 py-3 border-b border-gray-100 flex gap-1">
          {['ALL', 'PENDING', 'GRADED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-[11px] font-extrabold uppercase transition-all ${filter === f ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm font-medium">No submissions in this filter.</p>
            </div>
          ) : filtered.map(s => (
            <button key={s.id} onClick={() => { setSelected(s); setScore(s.grade || ''); setFeedback(s.feedback || ''); }}
              className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${selected?.id === s.id ? 'bg-primary/5 border-r-2 border-primary' : ''}`}>
              {/* Status dot */}
              <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${s.grade ? 'bg-green-400' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-textMain text-sm truncate">{s.studentName || `Student ${s.studentId}`}</p>
                <p className="text-xs text-secondary truncate">{s.assignmentTitle || `Assignment ${s.assignmentId}`}</p>
                <div className="flex items-center gap-2 mt-1">
                  {s.grade
                    ? <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Graded: {s.grade}</span>
                    : <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">Pending</span>
                  }
                  {s.submittedAt && <span className="text-[10px] text-secondary">{new Date(s.submittedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Grade Panel ─────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-extrabold text-textMain mb-2">Select a submission to grade</h3>
              <p className="text-secondary text-sm">Pick a submission from the left panel.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-secondary mb-1">Submission</p>
                <h2 className="text-2xl font-extrabold text-textMain">{selected.studentName || `Student ${selected.studentId}`}</h2>
                <p className="text-secondary text-sm mt-0.5">{selected.assignmentTitle || `Assignment ${selected.assignmentId}`}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-extrabold ${selected.grade ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {selected.grade ? `✓ Graded: ${selected.grade}/${selected.maxScore || 100}` : '⏳ Pending Review'}
              </div>
            </div>

            {/* Submission Content */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-8 mb-6">
              <h3 className="font-extrabold text-textMain mb-4 flex items-center gap-2">
                <span>📝</span> Submission
              </h3>
              {selected.fileUrl ? (
                <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="text-3xl">📄</div>
                  <div>
                    <p className="font-bold text-textMain">{selected.fileName || 'Submitted File'}</p>
                    <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold hover:underline">Download →</a>
                  </div>
                </div>
              ) : selected.textContent ? (
                <div className="bg-gray-50 rounded-2xl p-5 text-textMain text-sm leading-relaxed border border-gray-200 whitespace-pre-wrap">
                  {selected.textContent}
                </div>
              ) : (
                <p className="text-secondary text-sm">No submission content available.</p>
              )}
              {selected.submittedAt && (
                <p className="text-xs text-secondary mt-4 font-medium">
                  Submitted: {new Date(selected.submittedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Previous feedback */}
            {selected.grade && selected.feedback && (
              <div className="bg-green-50 border border-green-200 rounded-3xl p-6 mb-6">
                <p className="font-extrabold text-green-700 mb-2">Previous Feedback</p>
                <p className="text-green-800 text-sm">{selected.feedback}</p>
              </div>
            )}

            {/* Grading Form */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-8">
              <h3 className="font-extrabold text-textMain mb-6">Grade This Submission</h3>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Score</label>
                  <div className="relative">
                    <input type="number" min="0" max={selected.maxScore || 100} value={score} onChange={e => setScore(e.target.value)} className="input-field text-2xl font-extrabold text-primary" placeholder="0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">/ {selected.maxScore || 100}</span>
                  </div>
                </div>
                <div className="flex items-end">
                  {score && (
                    <div className="bg-primary/10 rounded-2xl p-4 text-center w-full">
                      <p className="text-3xl font-extrabold text-primary">{Math.round((parseFloat(score) / (selected.maxScore || 100)) * 100)}%</p>
                      <p className="text-xs text-secondary font-medium mt-1">
                        {parseFloat(score) >= 90 ? '🏆 Excellent' : parseFloat(score) >= 70 ? '✅ Good' : parseFloat(score) >= 50 ? '⚠️ Average' : '❌ Needs work'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Feedback (visible to student)</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={5} className="input-field resize-none" placeholder="Write detailed feedback to help the student improve..." />
              </div>

              <button onClick={handleGrade} disabled={grading || !score} className="btn-primary w-full py-4 text-base shadow-soft-purple disabled:opacity-60 flex items-center justify-center gap-2">
                {grading ? 'Saving Grade...' : <><span>✅</span> Submit Grade</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingQueue;
