import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentThread from '../CommentThread';

// ── Standalone Assignment Section ─────────────────────────────────────────────
// Handles: load past submission, show grade, edit before due, resubmit after due
const AssignmentSection = ({ lesson, assignmentId, dueDate, isPastDue, maxScore, instructions, user, courseId, onMarkComplete, isDone }) => {
  const [pastSubmission, setPastSubmission] = useState(null); // latest submission from DB
  const [loadingPast, setLoadingPast] = useState(true);
  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'new'
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load the student's existing submission(s) for this assignment
  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/api/assignments/${assignmentId}/student/${user.id}`)
      .then(r => {
        const subs = r.data || [];
        if (subs.length > 0) {
          // Most recent first
          const latest = subs.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
          setPastSubmission(latest);
          setSubmissionText(latest.textContent || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPast(false));
  }, [assignmentId, user?.id]);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async () => {
    if (!submissionText.trim() && !submissionFile) return;
    setSubmitting(true);
    try {
      let fileUrl = submissionFile ? await toBase64(submissionFile) : null;
      const payload = {
        studentId: user?.id || 1,
        courseId,
        textContent: submissionText || (submissionFile ? `[File: ${submissionFile.name}]` : ''),
        fileUrl,
      };

      let res;
      // Edit existing (before due) vs new submission (after due or no prior submission)
      if (mode === 'edit' && pastSubmission?.id && !isPastDue) {
        res = await axios.put(`/api/assignments/submissions/${pastSubmission.id}`, payload);
      } else {
        res = await axios.post(`/api/assignments/${assignmentId}/submit`, payload);
      }
      setPastSubmission(res.data);
      setMode('view');
      onMarkComplete(lesson.id);
    } catch (e) {
      console.error('Submission error:', e);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
      setSubmissionFile(null);
    }
  };

  const scorePercent = pastSubmission?.score != null && maxScore
    ? Math.round((pastSubmission.score / maxScore) * 100) : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">📎</div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 block">Assignment</span>
            <h1 className="text-2xl font-extrabold text-textMain">{lesson.title}</h1>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-6">
          <h3 className="font-extrabold text-amber-800 mb-3 text-sm uppercase tracking-wider">📋 Instructions</h3>
          <p className="text-amber-900 leading-relaxed">{instructions || "Follow the instructor's instructions and submit your work."}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            {dueDate && (
              <span className={`text-sm font-semibold ${isPastDue ? 'text-red-600' : 'text-amber-700'}`}>
                📅 Due: {new Date(dueDate).toLocaleDateString()} {isPastDue ? '⚠️ Past Due' : ''}
              </span>
            )}
            {maxScore && <span className="text-amber-700 text-sm font-semibold">🏆 Max: {maxScore} pts</span>}
          </div>
        </div>

        {/* ── GRADE CARD (shown if graded) ── */}
        {pastSubmission?.status === 'GRADED' && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-green-800 text-lg">🎓 Grade Received</h3>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-green-700">
                  {pastSubmission.score != null ? pastSubmission.score : '–'}
                  {maxScore && <span className="text-lg text-green-500"> / {maxScore}</span>}
                </p>
                {scorePercent != null && (
                  <p className={`text-sm font-bold ${scorePercent >= 90 ? 'text-green-600' : scorePercent >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                    {scorePercent}% {scorePercent >= 90 ? '🌟 Excellent' : scorePercent >= 70 ? '👍 Good' : '📚 Needs Work'}
                  </p>
                )}
              </div>
            </div>
            {/* Progress bar */}
            {scorePercent != null && (
              <div className="w-full bg-green-100 rounded-full h-2.5 mb-4">
                <div className={`h-2.5 rounded-full transition-all ${scorePercent >= 90 ? 'bg-green-500' : scorePercent >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${scorePercent}%` }} />
              </div>
            )}
            {pastSubmission.feedback && (
              <div className="bg-white rounded-2xl p-4 border border-green-100">
                <p className="text-xs font-extrabold uppercase tracking-wider text-green-700 mb-2">Instructor Feedback</p>
                <p className="text-green-900 text-sm leading-relaxed">"{pastSubmission.feedback}"</p>
              </div>
            )}
            <p className="text-xs text-green-600 mt-3 font-medium">
              Graded on {new Date(pastSubmission.gradedAt || pastSubmission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* ── PAST SUBMISSION VIEWER ── */}
        {pastSubmission && mode === 'view' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-textMain">Your Submission</h3>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  pastSubmission.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {pastSubmission.status === 'GRADED' ? '✅ Graded' : '⏳ Pending Review'}
                </span>
                <span className="text-xs text-secondary">
                  {new Date(pastSubmission.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {pastSubmission.textContent && !pastSubmission.textContent.startsWith('[File:') && (
              <div className="bg-gray-50 rounded-2xl p-4 text-sm text-textMain leading-relaxed whitespace-pre-wrap border border-gray-100">
                {pastSubmission.textContent}
              </div>
            )}
            {(pastSubmission.fileUrl || pastSubmission.textContent?.startsWith('[File:')) && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <span className="text-2xl">📎</span>
                <span className="text-blue-700 font-semibold text-sm">File submitted</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-5">
              {!isPastDue && pastSubmission.status !== 'GRADED' && (
                <button onClick={() => { setMode('edit'); setSubmissionText(pastSubmission.textContent || ''); }}
                  className="btn-secondary text-sm flex-1">
                  ✏️ Edit Submission
                </button>
              )}
              {isPastDue && (
                <button onClick={() => setMode('new')} className="btn-primary text-sm flex-1 shadow-soft-purple">
                  📤 Resubmit (Late)
                </button>
              )}
            </div>
            {isPastDue && pastSubmission.status !== 'GRADED' && (
              <p className="text-xs text-red-500 mt-2 font-medium">⚠️ Due date passed — editing is disabled. You may upload a new (late) submission.</p>
            )}
          </div>
        )}

        {/* ── SUBMISSION FORM (edit or new) ── */}
        {(mode === 'edit' || mode === 'new' || (!loadingPast && !pastSubmission)) && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-textMain">
                {mode === 'edit' ? '✏️ Edit Your Submission' : pastSubmission ? '📤 New Submission (Late)' : '📝 Your Submission'}
              </h3>
              {mode !== 'view' && pastSubmission && (
                <button onClick={() => setMode('view')} className="text-xs text-secondary hover:text-textMain font-semibold">
                  ← Cancel
                </button>
              )}
            </div>

            {/* Text area — only editable before due (or for new submission) */}
            {(mode === 'edit' || !isPastDue || !pastSubmission) && (
              <>
                <textarea
                  value={submissionText}
                  onChange={e => setSubmissionText(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-textMain focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none mb-5"
                  placeholder="Type your answer here..."
                />
              </>
            )}

            {/* File upload */}
            {submissionFile ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <span className="text-green-700 font-semibold text-sm">{submissionFile.name}</span>
                <button onClick={() => setSubmissionFile(null)} className="ml-auto text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
              </div>
            ) : null}

            <label className="block mb-5 cursor-pointer">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-primary hover:bg-primary/5 transition-all">
                <div className="text-2xl mb-1">☁️</div>
                <p className="text-sm font-semibold text-textMain">Upload a file or <span className="text-primary underline">browse</span></p>
                <p className="text-xs text-secondary mt-0.5">PDF, DOC, DOCX accepted</p>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={e => { if (e.target.files[0]) { setSubmissionFile(e.target.files[0]); } }} />
              </div>
            </label>

            <button onClick={handleSubmit}
              disabled={submitting || (!submissionText.trim() && !submissionFile)}
              className="btn-primary w-full py-4 text-base shadow-soft-purple disabled:opacity-50">
              {submitting ? 'Submitting…' : mode === 'edit' ? 'Save Changes →' : 'Submit Assignment →'}
            </button>
          </div>
        )}

        {loadingPast && !pastSubmission && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-secondary text-sm">Loading your submission…</span>
          </div>
        )}

        <CommentThread lessonId={lesson.id} courseId={courseId} currentUser={user} />
      </div>
    </div>
  );
};

// ── Main LessonContent ────────────────────────────────────────────────────────
const LessonContent = ({ lesson, assignments, quizzes, user, courseId, onMarkComplete, completedLessons }) => {
  const [submitting, setSubmitting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);


  const isDone = completedLessons.includes(lesson?.id);

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-12">
        <div>
          <div className="text-6xl mb-4">👈</div>
          <h3 className="text-xl font-bold text-textMain mb-2">Select a lesson to begin</h3>
          <p className="text-secondary">Choose any lesson from the sidebar to start learning.</p>
        </div>
      </div>
    );
  }

  // ── VIDEO ──────────────────────────────────────────────────────────────────
  if (lesson.type === 'video') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          {/* Video */}
          <div className="w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden mb-8 relative shadow-soft group">
            {lesson.videoUrl ? (
              <iframe src={lesson.videoUrl} className="w-full h-full" allowFullScreen title={lesson.title} />
            ) : (
              <>
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80" alt="Video" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <svg className="w-10 h-10 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-textMain mb-3">{lesson.title}</h1>
          {lesson.content && <p className="text-secondary leading-relaxed mb-8">{lesson.content}</p>}
          {!isDone && (
            <button onClick={() => onMarkComplete(lesson.id)} className="btn-primary flex items-center gap-2 shadow-soft-purple">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              Mark as Complete
            </button>
          )}
          {isDone && <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-bold text-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>Completed!</div>}
          <CommentThread lessonId={lesson.id} courseId={courseId} currentUser={user} />
        </div>
      </div>
    );
  }

  // ── TEXT ───────────────────────────────────────────────────────────────────
  if (lesson.type === 'text') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          <h1 className="text-3xl font-extrabold text-textMain mb-8">{lesson.title}</h1>
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-soft text-textMain leading-relaxed whitespace-pre-wrap mb-8 border-l-4 border-l-primary">
            {lesson.content || 'No content available.'}
          </div>
          {!isDone && <button onClick={() => onMarkComplete(lesson.id)} className="btn-primary flex items-center gap-2 shadow-soft-purple"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>Mark as Complete</button>}
          {isDone && <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-bold text-sm">✓ Completed!</div>}
          <CommentThread lessonId={lesson.id} courseId={courseId} currentUser={user} />
        </div>
      </div>
    );
  }

  // ── ASSIGNMENT ─────────────────────────────────────────────────────────────
  if (lesson.type === 'assignment') {
    const assignmentRecord = assignments.find(a => String(a.lessonId) === String(lesson.id));
    const assignmentId = assignmentRecord?.id ?? lesson.id;
    const dueDate = assignmentRecord?.dueDate || lesson.dueDate;
    const isPastDue = dueDate ? new Date(dueDate) < new Date() : false;
    const maxScore = assignmentRecord?.maxScore || lesson.maxScore;

    return (
      <AssignmentSection
        lesson={lesson}
        assignmentId={assignmentId}
        dueDate={dueDate}
        isPastDue={isPastDue}
        maxScore={maxScore}
        instructions={assignmentRecord?.instructions || lesson.instructions || lesson.content}
        user={user}
        courseId={courseId}
        onMarkComplete={onMarkComplete}
        isDone={isDone}
      />
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (lesson.type === 'quiz') {
    const quizData = quizzes.find(q => q.lessonId === lesson.id);

    const handleQuizSubmit = async () => {
      setSubmitting(true);
      try {
        await axios.post(`/api/quizzes/${quizData?.id}/attempt`, { studentId: user?.id || 1, courseId, answers: quizAnswers });
        setQuizResult({ score: 85, total: 100 });
        onMarkComplete(lesson.id);
      } catch (e) { console.error(e); }
      finally { setSubmitting(false); }
    };

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">❓</div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 block">Quiz</span>
              <h1 className="text-2xl font-extrabold text-textMain">{lesson.title}</h1>
            </div>
          </div>

          {quizResult ? (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-extrabold text-green-700 mb-2">Quiz Complete!</h2>
              <p className="text-green-600 text-lg">Great work on finishing this quiz.</p>
            </div>
          ) : (quizData?.questions || []).length > 0 ? (
            <div className="space-y-6">
              {quizData.questions.map((q, qi) => (
                <div key={qi} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft">
                  <p className="font-bold text-textMain mb-4">{qi + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {(q.options || []).map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${quizAnswers[qi] === oi ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="radio" name={`q${qi}`} className="hidden" onChange={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))} />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${quizAnswers[qi] === oi ? 'border-primary' : 'border-gray-300'}`}>
                          {quizAnswers[qi] === oi && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <span className="text-sm text-textMain">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={handleQuizSubmit} disabled={submitting} className="btn-primary w-full py-4 text-base shadow-soft-purple disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Quiz →'}
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-soft">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-extrabold text-textMain mb-3">Ready to take the quiz?</h3>
              <p className="text-secondary mb-8">Make sure you've reviewed all the material in this section.</p>
              <button onClick={handleQuizSubmit} disabled={submitting} className="btn-primary px-10 py-4 shadow-soft-purple disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Start Quiz Now →'}
              </button>
            </div>
          )}
          <CommentThread lessonId={lesson.id} courseId={courseId} currentUser={user} />
        </div>
      </div>
    );
  }

  return null;
};

export default LessonContent;
