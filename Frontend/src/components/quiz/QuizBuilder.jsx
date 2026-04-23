import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TYPE_LABELS = {
  MCQ_SINGLE: { label: 'Single Choice', icon: '🔘', color: 'blue' },
  MCQ_MULTI:  { label: 'Multi Select',  icon: '☑️', color: 'purple' },
  TEXT:       { label: 'Text Answer',   icon: '✏️', color: 'amber' },
};

const EMPTY_QUESTION = {
  text: '',
  questionType: 'MCQ_SINGLE',
  options: ['', '', '', ''],
  correctAnswer: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const QuizBuilder = ({ lesson, courseId, user }) => {
  const [quiz, setQuiz]           = useState(null);   // saved Quiz record
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editQ, setEditQ]         = useState(null);   // { ...question } or null
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  // AI generate state
  const [showAI, setShowAI]       = useState(false);
  const [aiContext, setAiContext]  = useState('');
  const [aiCount, setAiCount]     = useState(5);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError]     = useState('');

  // Load existing quiz for this lesson
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/quizzes/lesson/${lesson.id}`);
        const quizzes = res.data || [];
        if (quizzes.length > 0) {
          const q = quizzes[0];
          setQuiz(q);
          const qRes = await axios.get(`/api/quizzes/${q.id}/questions/instructor`);
          setQuestions(qRes.data || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [lesson.id]);

  // ── Ensure quiz record exists before adding questions ──────────────────────
  const ensureQuiz = async () => {
    if (quiz) return quiz;
    const res = await axios.post('/api/quizzes', {
      lessonId: lesson.id,
      courseId,
      title: lesson.title || 'Quiz',
      passScorePercent: 60,
    });
    setQuiz(res.data);
    return res.data;
  };

  // ── Save a question (create or update) ────────────────────────────────────
  const handleSaveQuestion = async () => {
    if (!editQ?.text?.trim()) return;
    setSaving(true);
    try {
      const q = ensureCleanQuestion(editQ);
      let saved;
      if (q.id) {
        const res = await axios.put(`/api/quizzes/questions/${q.id}`, q);
        saved = res.data;
        setQuestions(prev => prev.map(x => x.id === saved.id ? saved : x));
      } else {
        const currentQuiz = await ensureQuiz();
        const res = await axios.post(`/api/quizzes/${currentQuiz.id}/questions`, q);
        saved = res.data;
        setQuestions(prev => [...prev, saved]);
      }
      setEditQ(null);
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.message || e.message));
    } finally { setSaving(false); }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    setDeleting(qId);
    try {
      await axios.delete(`/api/quizzes/questions/${qId}`);
      setQuestions(prev => prev.filter(x => x.id !== qId));
    } catch { alert('Delete failed'); }
    finally { setDeleting(null); }
  };

  // ── AI generation ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!aiContext.trim()) return;
    setAiGenerating(true); setAiError('');
    try {
      const currentQuiz = quiz || null;
      const res = await axios.post('/api/quizzes/generate', {
        context: aiContext,
        questionCount: aiCount,
        lessonId: lesson.id,
        courseId,
        title: lesson.title || 'AI Quiz',
      });
      const { quiz: newQuiz, questions: newQs } = res.data;
      // If we now have a quiz from AI (new quiz created), reload with instructor questions
      if (newQuiz) {
        setQuiz(newQuiz);
        const qRes = await axios.get(`/api/quizzes/${newQuiz.id}/questions/instructor`);
        setQuestions(qRes.data || []);
      }
      setShowAI(false); setAiContext('');
    } catch (e) {
      setAiError(e.response?.data?.error || e.message || 'Generation failed.');
    } finally { setAiGenerating(false); }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const ensureCleanQuestion = (q) => {
    const clean = { ...q };
    if (q.questionType === 'TEXT') { clean.options = []; }
    else { clean.options = (q.options || []).filter(o => o.trim()); }
    return clean;
  };

  const openNew = () => setEditQ({ ...EMPTY_QUESTION, options: ['', '', '', ''] });
  const openEdit = (q) => setEditQ({ ...q, options: q.options?.length ? [...q.options] : ['', '', '', ''] });

  const setOption = (i, val) => setEditQ(p => {
    const opts = [...(p.options || [])];
    opts[i] = val;
    return { ...p, options: opts };
  });

  const addOption = () => setEditQ(p => ({ ...p, options: [...(p.options || []), ''] }));
  const removeOption = (i) => setEditQ(p => {
    const opts = p.options.filter((_, idx) => idx !== i);
    return { ...p, options: opts };
  });

  // For MCQ_MULTI correctAnswer is comma-separated indices
  const toggleMultiCorrect = (i) => {
    const current = (editQ.correctAnswer || '').split(',').map(s => s.trim()).filter(Boolean);
    const idx = current.indexOf(String(i));
    let next;
    if (idx >= 0) { next = current.filter(x => x !== String(i)); }
    else { next = [...current, String(i)].sort(); }
    setEditQ(p => ({ ...p, correctAnswer: next.join(',') }));
  };
  const isMultiCorrect = (i) => (editQ?.correctAnswer || '').split(',').map(s=>s.trim()).includes(String(i));

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-textMain">Quiz Builder</h2>
          <p className="text-secondary text-sm">{questions.length} question{questions.length !== 1 ? 's' : ''} · Pass score: {quiz?.passScorePercent || 60}%</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAI(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-extrabold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
            ✨ AI Generate
          </button>
          <button onClick={openNew}
            className="btn-primary text-sm px-4 py-2.5 shadow-soft-purple">
            + Add Question
          </button>
        </div>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">❓</div>
          <p className="font-bold text-textMain mb-1">No questions yet</p>
          <p className="text-secondary text-sm">Add questions manually or use AI to generate them.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const typeInfo = TYPE_LABELS[q.questionType] || TYPE_LABELS.MCQ_SINGLE;
            return (
              <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-xs font-extrabold text-secondary mt-0.5 shrink-0">Q{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-textMain text-sm leading-relaxed">{q.text}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-${typeInfo.color}-50 text-${typeInfo.color}-700`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        {q.questionType !== 'TEXT' && (
                          <span className="text-[10px] text-secondary font-medium">
                            {q.options?.length || 0} options · Ans: {q.correctAnswer || '–'}
                          </span>
                        )}
                        {q.questionType === 'TEXT' && (
                          <span className="text-[10px] text-secondary font-medium italic">
                            Expected: "{q.correctAnswer}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEdit(q)}
                      className="text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteQuestion(q.id)} disabled={deleting === q.id}
                      className="text-xs bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                      {deleting === q.id ? '…' : 'Del'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit / Add Question Modal ─────────────────────────────────────── */}
      {editQ && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-textMain mb-6">
              {editQ.id ? '✏️ Edit Question' : '➕ Add Question'}
            </h3>
            <div className="space-y-5">

              {/* Question text */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Question</label>
                <textarea value={editQ.text} onChange={e => setEditQ(p => ({...p, text: e.target.value}))}
                  rows={3} className="input-field text-sm resize-none w-full" placeholder="Enter your question..." />
              </div>

              {/* Question type */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_LABELS).map(([val, info]) => (
                    <button key={val} onClick={() => setEditQ(p => ({...p, questionType: val, correctAnswer: ''}))}
                      className={`p-3 rounded-xl border-2 text-xs font-extrabold text-center transition-all ${
                        editQ.questionType === val ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-secondary hover:border-gray-300'
                      }`}>
                      <div className="text-lg mb-0.5">{info.icon}</div>
                      {info.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MCQ options */}
              {(editQ.questionType === 'MCQ_SINGLE' || editQ.questionType === 'MCQ_MULTI') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-secondary">
                      Options {editQ.questionType === 'MCQ_MULTI' ? '(select all correct)' : '(select correct)'}
                    </label>
                    <button onClick={addOption} className="text-xs text-primary font-bold hover:underline">+ Add Option</button>
                  </div>
                  <div className="space-y-2 text-black">
                    {(editQ.options || []).map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {/* Correct selector */}
                        {editQ.questionType === 'MCQ_SINGLE' ? (
                          <button onClick={() => setEditQ(p => ({...p, correctAnswer: String(i)}))}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              editQ.correctAnswer === String(i) ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                            }`}>
                            {editQ.correctAnswer === String(i) && <div className="w-2 h-2 rounded-full bg-white"/>}
                          </button>
                        ) : (
                          <button onClick={() => toggleMultiCorrect(i)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all text-white text-xs font-bold ${
                              isMultiCorrect(i) ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                            }`}>
                            {isMultiCorrect(i) && '✓'}
                          </button>
                        )}
                        <input value={opt} onChange={e => setOption(i, e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                          placeholder={`Option ${i + 1}`} />
                        {(editQ.options?.length || 0) > 2 && (
                          <button onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-secondary mt-2">
                    {editQ.questionType === 'MCQ_SINGLE' ? '🔘 Click the circle to mark the correct answer' : '☑️ Check all correct answers'}
                  </p>
                </div>
              )}

              {/* TEXT answer */}
              {editQ.questionType === 'TEXT' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">
                    Exact Expected Answer <span className="text-red-500">*</span>
                  </label>
                  <input value={editQ.correctAnswer} onChange={e => setEditQ(p => ({...p, correctAnswer: e.target.value}))}
                    className="input-field text-sm w-full text-black" placeholder="The student must type this exactly (case-insensitive)" />
                  <p className="text-xs text-secondary mt-1.5">Comparison is case-insensitive and trims whitespace.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditQ(null)} className="flex-1 btn-secondary py-3">Cancel</button>
              <button onClick={handleSaveQuestion} disabled={saving || !editQ.text?.trim()}
                className="flex-1 btn-primary py-3 shadow-soft-purple disabled:opacity-50">
                {saving ? 'Saving…' : editQ.id ? 'Save Changes' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Generate Modal ─────────────────────────────────────────────── */}
      {showAI && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-md">✨</div>
              <div>
                <h3 className="text-xl font-extrabold text-textMain">AI Quiz Generator</h3>
                <p className="text-secondary text-sm">Powered by Gemini</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Topic / Context</label>
                <textarea value={aiContext} onChange={e => setAiContext(e.target.value)} rows={5}
                  className="input-field text-sm resize-none w-full"
                  placeholder="Paste your lesson content, topic description, or any context you want the quiz to be based on..." />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Number of Questions</label>
                <div className="flex gap-2">
                  {[3, 5, 8, 10].map(n => (
                    <button key={n} onClick={() => setAiCount(n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-extrabold border-2 transition-all ${
                        aiCount === n ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-secondary'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {aiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{aiError}</div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAI(false); setAiError(''); }} className="flex-1 btn-secondary py-3">Cancel</button>
              <button onClick={handleGenerate} disabled={aiGenerating || !aiContext.trim()}
                className="flex-1 py-3 rounded-2xl font-extrabold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md disabled:opacity-50 transition-all">
                {aiGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Generating…
                  </span>
                ) : '✨ Generate Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;
