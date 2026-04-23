import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const SEVERITY_STYLE = {
  INFO:     { bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-200',  icon: 'ℹ️' },
  WARNING:  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '⚠️' },
  CRITICAL: { bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200',   icon: '🔴' },
};

const CourseWarnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({ message: '', severity: 'WARNING', targetStudentId: '' });
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/api/courses/instructor/${user.id}`)
      .then(r => { setCourses(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const loadCourseData = async (course) => {
    setSelectedCourse(course);
    setWarnings([]);
    setEnrolledStudents([]);
    try {
      const [wRes, sRes] = await Promise.all([
        axios.get(`/api/community/warnings/course/${course.id}`),
        axios.get(`/api/orders/course/${course.id}/students`).catch(() => ({ data: [] })),
      ]);
      setWarnings(wRes.data || []);
      setEnrolledStudents(sRes.data || []);
    } catch (e) { console.error(e); }
  };

  const handleIssueWarning = async () => {
    if (!form.message.trim() || !selectedCourse) return;
    setIssuing(true);
    try {
      await axios.post('/api/community/warnings', {
        issuedByUserId: user.id,
        issuedByName: user.username,
        issuedByRole: 'INSTRUCTOR',
        courseId: selectedCourse.id,
        targetStudentId: form.targetStudentId ? parseInt(form.targetStudentId) : null,
        message: form.message,
        severity: form.severity,
      });
      setForm({ message: '', severity: 'WARNING', targetStudentId: '' });
      setShowIssueForm(false);
      await loadCourseData(selectedCourse);
    } catch (e) { alert('Failed to issue warning'); }
    finally { setIssuing(false); }
  };

  const handleResolve = async (id) => {
    await axios.patch(`/api/community/warnings/${id}/resolve`);
    setWarnings(ws => ws.map(w => w.id === id ? { ...w, resolved: true } : w));
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col py-8 shrink-0">
        <div className="px-6 mb-6">
          <button onClick={() => navigate('/instructor/dashboard')} className="flex items-center gap-2 text-secondary hover:text-primary text-sm font-semibold mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Dashboard
          </button>
          <h2 className="font-extrabold text-textMain text-xl">⚠️ Course Warnings</h2>
          <p className="text-secondary text-xs mt-1">Select a course to view and issue warnings</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />)
          ) : courses.length === 0 ? (
            <p className="text-secondary text-sm text-center py-8">No courses yet.</p>
          ) : courses.map(c => (
            <button
              key={c.id}
              onClick={() => loadCourseData(c)}
              className={`w-full text-left p-4 rounded-2xl transition-all ${
                selectedCourse?.id === c.id
                  ? 'bg-primary text-white shadow-soft-purple'
                  : 'hover:bg-gray-50 text-textMain'
              }`}
            >
              <p className="font-bold text-sm truncate">{c.title}</p>
              <p className={`text-xs mt-0.5 ${selectedCourse?.id === c.id ? 'text-white/70' : 'text-secondary'}`}>
                {c.status || 'DRAFT'}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        {!selectedCourse ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-extrabold text-textMain mb-2">Select a Course</h3>
              <p className="text-secondary">Choose a course from the sidebar to view its warnings.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-secondary text-sm font-medium mb-1">Warnings for</p>
                <h1 className="text-3xl font-extrabold text-textMain">{selectedCourse.title}</h1>
              </div>
              <button
                onClick={() => setShowIssueForm(true)}
                className="btn-primary flex items-center gap-2 shadow-soft-purple"
              >
                ⚠️ Issue Warning
              </button>
            </div>

            {/* Warnings list */}
            {warnings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-soft">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-textMain mb-2">No warnings issued</h3>
                <p className="text-secondary">This course has a clean record.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {warnings.map(w => {
                  const s = SEVERITY_STYLE[w.severity] || SEVERITY_STYLE.WARNING;
                  return (
                    <div key={w.id} className={`bg-white rounded-3xl border ${s.border} p-6 shadow-soft ${w.resolved ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{s.icon}</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{w.severity}</span>
                              {w.targetStudentId && <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">Student #{w.targetStudentId}</span>}
                              {w.resolved && <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Resolved</span>}
                            </div>
                            <p className="text-textMain font-medium leading-relaxed">{w.message}</p>
                            <p className="text-secondary text-xs mt-2">
                              Issued by <strong>{w.issuedByName}</strong> · {new Date(w.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {!w.resolved && (
                          <button onClick={() => handleResolve(w.id)} className="text-xs font-bold text-green-600 hover:underline shrink-0">
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Issue Warning Modal */}
        {showIssueForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl">
              <h3 className="text-xl font-extrabold text-textMain mb-6">⚠️ Issue Warning</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">Severity</label>
                  <div className="flex gap-2">
                    {['INFO', 'WARNING', 'CRITICAL'].map(s => (
                      <button key={s} onClick={() => setForm(p => ({...p, severity: s}))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all border-2 ${
                          form.severity === s
                            ? s === 'INFO' ? 'border-blue-400 bg-blue-50 text-blue-700'
                            : s === 'WARNING' ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-red-400 bg-red-50 text-red-700'
                            : 'border-gray-200 text-secondary'
                        }`}>
                        {s === 'INFO' ? 'ℹ️' : s === 'WARNING' ? '⚠️' : '🔴'} {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">Target Student (optional)</label>
                  <select value={form.targetStudentId} onChange={e => setForm(p => ({...p, targetStudentId: e.target.value}))}
                    className="input-field text-sm">
                    <option value="">All students / Course-level warning</option>
                    {enrolledStudents.map(s => (
                      <option key={s.id} value={s.id}>Student #{s.studentId}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">Warning Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({...p, message: e.target.value}))}
                    rows={4}
                    className="input-field resize-none text-sm"
                    placeholder="Describe the issue clearly..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowIssueForm(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                <button
                  onClick={handleIssueWarning}
                  disabled={issuing || !form.message.trim()}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-2xl transition-all disabled:opacity-50"
                >
                  {issuing ? 'Issuing...' : '⚠️ Issue Warning'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseWarnings;
