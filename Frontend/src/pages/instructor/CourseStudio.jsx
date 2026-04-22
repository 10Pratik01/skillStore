import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const LESSON_TYPES = [
  { value: 'video', label: 'Video Lesson', icon: '🎬' },
  { value: 'text', label: 'Text Lesson', icon: '📄' },
  { value: 'assignment', label: 'Assignment', icon: '📎' },
  { value: 'quiz', label: 'Quiz', icon: '❓' },
];

const CourseStudio = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [selected, setSelected] = useState(null); // { type:'lesson'|'section', data }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviting, setInviting] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [activeSettingsTab, setActiveSettingsTab] = useState('content'); // 'content'|'access'|'students'
  const [editLesson, setEditLesson] = useState({ title: '', type: 'video', content: '', videoUrl: '', instructions: '', dueDate: '', maxScore: '' });

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`/api/courses/${courseId}`);
      setCourse(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`/api/orders/course/${courseId}/students`);
      setEnrolledStudents(res.data || []);
    } catch (e) { setEnrolledStudents([]); }
  };

  useEffect(() => { fetchCourse(); fetchStudents(); }, [courseId]);

  const selectLesson = (lesson) => {
    setSelected({ type: 'lesson', data: lesson });
    setEditLesson({ title: lesson.title || '', type: lesson.type || 'video', content: lesson.content || '', videoUrl: lesson.videoUrl || '', instructions: lesson.instructions || '', dueDate: lesson.dueDate || '', maxScore: lesson.maxScore || '' });
  };

  const handleSaveLesson = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.put(`/api/courses/${courseId}/lessons/${selected.data.id}`, editLesson);
      fetchCourse();
    } catch (e) { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await axios.delete(`/api/courses/${courseId}/lessons/${lessonId}`);
      setSelected(null);
      fetchCourse();
    } catch (e) { alert('Delete failed'); }
  };

  const handleAddLesson = async (sectionId, type) => {
    try {
      await axios.post(`/api/courses/${courseId}/sections/${sectionId}/lessons`, { title: 'New ' + type + ' lesson', type });
      fetchCourse();
    } catch (e) { alert('Add failed'); }
  };

  const handleAddSection = async () => {
    try {
      await axios.post(`/api/courses/${courseId}/sections`, { title: 'New Section', order: (course?.sections?.length || 0) + 1 });
      fetchCourse();
    } catch (e) { alert('Add section failed'); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its lessons?')) return;
    try {
      await axios.delete(`/api/courses/${courseId}/sections/${sectionId}`);
      fetchCourse();
    } catch (e) { alert('Delete section failed'); }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    setInviting(true);
    try {
      await axios.post('/api/orders/instructor-enroll', { courseId: parseInt(courseId), studentUsername: inviteUsername.trim() });
      setInviteUsername('');
      fetchStudents();
      alert(`Successfully invited ${inviteUsername}!`);
    } catch (e) {
      alert(e.response?.data?.message || 'Could not invite student. Check the username/email.');
    } finally { setInviting(false); }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the course?')) return;
    try {
      await axios.delete(`/api/orders/enroll/${courseId}/student/${studentId}`);
      fetchStudents();
    } catch (e) { alert('Remove failed'); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalLessons = (course?.sections || []).reduce((a, s) => a + (s.lessons || []).length, 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Structure Tree (Left) ────────────────────── */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
        {/* Top bar */}
        <div className="p-5 border-b border-gray-100">
          <button onClick={() => navigate('/instructor/dashboard')} className="flex items-center gap-2 text-secondary hover:text-primary text-sm font-semibold mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </button>
          <h2 className="font-extrabold text-textMain text-lg line-clamp-2">{course?.title || 'Untitled Course'}</h2>
          <p className="text-xs text-secondary mt-1">{(course?.sections || []).length} sections · {totalLessons} lessons</p>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(course?.sections || []).map((section, sIdx) => (
            <div key={section.id} className="bg-gray-50 rounded-2xl overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between p-3 bg-gray-100/60">
                <span className="font-bold text-textMain text-sm truncate">{section.title}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleDeleteSection(section.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-xs">🗑</button>
                </div>
              </div>
              {/* Lessons */}
              <div className="p-2 space-y-1.5">
                {(section.lessons || []).map((lesson) => (
                  <button key={lesson.id} onClick={() => selectLesson(lesson)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all text-sm ${selected?.data?.id === lesson.id ? 'bg-primary/10 text-primary' : 'text-textMain hover:bg-gray-100'}`}>
                    <span>{LESSON_TYPES.find(t => t.value === lesson.type)?.icon || '📄'}</span>
                    <span className="truncate font-medium">{lesson.title}</span>
                  </button>
                ))}
                {/* Add lesson buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {LESSON_TYPES.map(t => (
                    <button key={t.value} onClick={() => handleAddLesson(section.id, t.value)}
                      className="flex items-center gap-1 text-[11px] font-bold text-secondary hover:text-primary hover:bg-primary/5 px-2 py-1.5 rounded-lg border border-dashed border-gray-200 hover:border-primary transition-all">
                      <span>+</span>{t.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Add section */}
          <button onClick={handleAddSection}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-bold text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
            + Add Section
          </button>
        </div>
      </div>

      {/* ── Edit Panel (Center) ──────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-center p-12">
            <div>
              <div className="text-5xl mb-4">👈</div>
              <h3 className="text-xl font-extrabold text-textMain mb-2">Select a lesson to edit</h3>
              <p className="text-secondary text-sm">Click any lesson in the sidebar to edit its content.</p>
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-secondary">Editing</span>
                <h2 className="text-2xl font-extrabold text-textMain">{selected.data.title}</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleDeleteLesson(selected.data.id)} className="btn-secondary text-red-500 border-red-200 hover:bg-red-50 text-sm py-2">🗑 Delete</button>
                <button onClick={handleSaveLesson} disabled={saving} className="btn-primary shadow-soft-purple text-sm py-2 disabled:opacity-60">
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Title</label>
                <input value={editLesson.title} onChange={e => setEditLesson(p => ({ ...p, title: e.target.value }))} className="input-field text-lg font-semibold" placeholder="Lesson title..." />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Lesson Type</label>
                <div className="flex gap-3">
                  {LESSON_TYPES.map(t => (
                    <button key={t.value} onClick={() => setEditLesson(p => ({ ...p, type: t.value }))}
                      className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-bold transition-all ${editLesson.type === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-secondary hover:border-gray-300'}`}>
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-[11px]">{t.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {editLesson.type === 'video' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Video URL</label>
                  <input value={editLesson.videoUrl} onChange={e => setEditLesson(p => ({ ...p, videoUrl: e.target.value }))} className="input-field" placeholder="https://youtube.com/embed/..." />
                </div>
              )}

              {(editLesson.type === 'text' || editLesson.type === 'video') && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">{editLesson.type === 'video' ? 'Description' : 'Content'}</label>
                  <textarea value={editLesson.content} onChange={e => setEditLesson(p => ({ ...p, content: e.target.value }))} rows={8} className="input-field resize-none" placeholder="Write the lesson content..." />
                </div>
              )}

              {editLesson.type === 'assignment' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Instructions</label>
                    <textarea value={editLesson.instructions} onChange={e => setEditLesson(p => ({ ...p, instructions: e.target.value }))} rows={6} className="input-field resize-none" placeholder="What should students do?" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Due Date</label>
                      <input type="date" value={editLesson.dueDate} onChange={e => setEditLesson(p => ({ ...p, dueDate: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-secondary mb-2">Max Score</label>
                      <input type="number" value={editLesson.maxScore} onChange={e => setEditLesson(p => ({ ...p, maxScore: e.target.value }))} className="input-field" placeholder="100" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Right Settings Panel ─────────────────────── */}
      <div className="w-80 bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-y-auto">
        {/* Tabs */}
        <div className="p-4 border-b border-gray-100 flex gap-1">
          {[['content', '📋'], ['access', '🔒'], ['students', '🧑‍🎓']].map(([tab, icon]) => (
            <button key={tab} onClick={() => setActiveSettingsTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold capitalize transition-all ${activeSettingsTab === tab ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>
              {icon} {tab}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Content Tab */}
          {activeSettingsTab === 'content' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-textMain">Course Info</h4>
              <div><label className="block text-xs text-secondary font-bold uppercase tracking-wider mb-1.5">Title</label>
                <input className="input-field text-sm" defaultValue={course?.title} /></div>
              <div><label className="block text-xs text-secondary font-bold uppercase tracking-wider mb-1.5">Subtitle</label>
                <input className="input-field text-sm" defaultValue={course?.subtitle} /></div>
              <div><label className="block text-xs text-secondary font-bold uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows={4} className="input-field text-sm resize-none" defaultValue={course?.description} /></div>
              <button className="btn-primary w-full text-sm shadow-soft-purple">Save Changes</button>
            </div>
          )}

          {/* Access Tab */}
          {activeSettingsTab === 'access' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-textMain">Access Control</h4>
              <div>
                <label className="block text-xs text-secondary font-bold uppercase tracking-wider mb-2">Access Type</label>
                <div className="space-y-2">
                  {[['PUBLIC', '🌍 Public'], ['PASSWORD_PROTECTED', '🔒 Password Protected'], ['INVITE_ONLY', '✉️ Invite Only']].map(([val, label]) => (
                    <label key={val} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${course?.accessType === val ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                      <input type="radio" name="access" value={val} defaultChecked={course?.accessType === val} className="accent-primary" />
                      <span className="text-sm font-semibold text-textMain">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {course?.accessType === 'PASSWORD_PROTECTED' && (
                <div><label className="block text-xs text-secondary font-bold uppercase tracking-wider mb-1.5">Access Code</label>
                  <input className="input-field font-mono tracking-widest" defaultValue={course?.accessCode} />
                </div>
              )}
              <button className="btn-primary w-full text-sm shadow-soft-purple">Update Access</button>
            </div>
          )}

          {/* Students Tab */}
          {activeSettingsTab === 'students' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-textMain">Students ({enrolledStudents.length})</h4>

              {/* Invite form */}
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/15">
                <p className="text-xs font-extrabold text-primary uppercase tracking-wider mb-3">Invite Student</p>
                <input value={inviteUsername} onChange={e => setInviteUsername(e.target.value)} className="input-field text-sm mb-2" placeholder="Username or email..." />
                <button onClick={handleInvite} disabled={inviting || !inviteUsername.trim()} className="btn-primary w-full text-sm py-2.5 shadow-soft-purple disabled:opacity-60">
                  {inviting ? 'Inviting...' : '+ Send Invite'}
                </button>
              </div>

              {/* Enrolled list */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {enrolledStudents.length === 0 ? (
                  <p className="text-secondary text-sm text-center py-4">No students enrolled yet.</p>
                ) : enrolledStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {(s.username || s.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-textMain truncate">{s.username || s.name}</p>
                      <p className="text-xs text-secondary truncate">{s.email}</p>
                    </div>
                    <button onClick={() => handleRemoveStudent(s.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseStudio;
