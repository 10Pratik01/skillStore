import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Answers are NEVER sent from backend to this component.
// Grading happens 100% server-side via POST /:quizId/attempt
const QuizPlayer = ({ quiz, user, courseId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [answers, setAnswers]     = useState({}); // { questionId: "answer" }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null); // { score, total, scorePercent, passed, results }
  const [pastAttempt, setPastAttempt] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, aRes] = await Promise.all([
          axios.get(`/api/quizzes/${quiz.id}/questions`),
          axios.get(`/api/quizzes/${quiz.id}/student/${user?.id}`).catch(() => ({ data: [] })),
        ]);
        setQuestions(qRes.data || []);
        const attempts = aRes.data || [];
        if (attempts.length > 0) {
          const best = attempts.sort((a, b) => b.scorePercent - a.scorePercent)[0];
          setPastAttempt(best);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [quiz.id, user?.id]);

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id] || !String(answers[q.id]).trim());
    if (unanswered.length > 0) {
      if (!window.confirm(`${unanswered.length} question(s) unanswered. Submit anyway?`)) return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/quizzes/${quiz.id}/attempt`, {
        studentId: user?.id || 1,
        courseId,
        answers,
      });
      setResult(res.data);
      if (res.data.passed && onComplete) onComplete();
    } catch (e) {
      alert('Submission failed: ' + (e.response?.data?.message || e.message));
    } finally { setSubmitting(false); }
  };

  const toggleMulti = (qId, optionIdx) => {
    const current = (answers[qId] || '').split(',').map(s => s.trim()).filter(Boolean);
    const key = String(optionIdx);
    const idx = current.indexOf(key);
    let next = idx >= 0 ? current.filter(x => x !== key) : [...current, key].sort();
    setAnswers(p => ({ ...p, [qId]: next.join(',') }));
  };
  const isMultiSelected = (qId, optionIdx) =>
    (answers[qId] || '').split(',').map(s => s.trim()).includes(String(optionIdx));

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="text-center py-12 text-secondary bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
      <div className="text-4xl mb-2">📭</div>
      <p className="font-semibold">No questions in this quiz yet.</p>
    </div>
  );

  // ── RESULT SCREEN ──────────────────────────────────────────────────────────
  if (result) {
    const pct = result.scorePercent;
    return (
      <div className="max-w-lg mx-auto">
        <div className={`rounded-3xl p-8 text-center border-2 ${
          result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="text-6xl mb-4">{result.passed ? '🎉' : '📚'}</div>
          <h2 className={`text-2xl font-extrabold mb-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
            {result.passed ? 'Quiz Passed!' : 'Keep Practising'}
          </h2>
          <p className="text-secondary mb-6 text-sm">
            {result.score} / {result.total} correct
          </p>

          {/* Score circle */}
          <div className="w-28 h-28 mx-auto mb-6 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={result.passed ? '#22c55e' : '#ef4444'} strokeWidth="3"
                strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-extrabold ${result.passed ? 'text-green-700' : 'text-red-600'}`}>{pct}%</span>
            </div>
          </div>

          {/* Per-question result */}
          <div className="bg-white rounded-2xl p-4 mb-6 text-left space-y-2">
            {questions.map((q, i) => {
              const qResult = (result.results || []).find(r => r.questionId === q.id);
              return (
                <div key={q.id} className="flex items-start gap-3">
                  <span className={`text-lg shrink-0 mt-0.5 ${qResult?.correct ? 'text-green-500' : 'text-red-400'}`}>
                    {qResult?.correct ? '✓' : '✗'}
                  </span>
                  <p className="text-sm text-textMain leading-relaxed">{q.text}</p>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-secondary">
            Pass score: {quiz.passScorePercent || 60}%
            {!result.passed && ' — You can retake this quiz.'}
          </p>
          {!result.passed && (
            <button onClick={() => { setResult(null); setAnswers({}); }}
              className="mt-4 btn-primary w-full shadow-soft-purple">
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── QUIZ FORM ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-textMain">{quiz.title}</h2>
          <p className="text-secondary text-sm">{questions.length} questions · Pass: {quiz.passScorePercent || 60}%</p>
        </div>
        {pastAttempt && (
          <div className="text-right">
            <p className="text-xs text-secondary">Best attempt</p>
            <p className={`font-extrabold text-sm ${pastAttempt.passed ? 'text-green-600' : 'text-amber-600'}`}>
              {pastAttempt.scorePercent}% {pastAttempt.passed ? '✅' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, idx) => (
        <div key={q.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft">
          <div className="flex items-start gap-3 mb-5">
            <span className="text-xs font-extrabold text-secondary shrink-0 mt-0.5">Q{idx + 1}</span>
            <p className="font-semibold text-textMain leading-relaxed">{q.text}</p>
          </div>

          {/* MCQ_SINGLE */}
          {q.questionType === 'MCQ_SINGLE' && (
            <div className="space-y-2">
              {(q.options || []).map((opt, i) => (
                <label key={i} onClick={() => setAnswers(p => ({...p, [q.id]: String(i)}))}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q.id] === String(i)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    answers[q.id] === String(i) ? 'border-primary' : 'border-gray-300'
                  }`}>
                    {answers[q.id] === String(i) && <div className="w-2.5 h-2.5 rounded-full bg-primary"/>}
                  </div>
                  <span className="text-sm text-textMain">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* MCQ_MULTI */}
          {q.questionType === 'MCQ_MULTI' && (
            <div className="space-y-2">
              <p className="text-xs text-secondary mb-3 font-semibold">Select all that apply</p>
              {(q.options || []).map((opt, i) => (
                <label key={i} onClick={() => toggleMulti(q.id, i)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    isMultiSelected(q.id, i)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 text-white text-xs font-bold transition-all ${
                    isMultiSelected(q.id, i) ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}>
                    {isMultiSelected(q.id, i) && '✓'}
                  </div>
                  <span className="text-sm text-textMain">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* TEXT */}
          {q.questionType === 'TEXT' && (
            <input
              value={answers[q.id] || ''}
              onChange={e => setAnswers(p => ({...p, [q.id]: e.target.value}))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              placeholder="Type your answer..."
            />
          )}
        </div>
      ))}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={submitting}
        className="btn-primary w-full py-4 text-base shadow-soft-purple disabled:opacity-50">
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            Submitting…
          </span>
        ) : 'Submit Quiz →'}
      </button>
    </div>
  );
};

export default QuizPlayer;
