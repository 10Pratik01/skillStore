import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';

const TABS = ['content', 'submissions', 'community', 'reviews'];
const TAB_ICONS = { content: '📋', submissions: '📎', community: '💬', reviews: '⭐' };
const LESSON_ICON = { video: '🎬', text: '📄', assignment: '📎', quiz: '❓' };

const AdminCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [editLesson, setEditLesson] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCourse = async () => {
    const res = await axios.get(`/api/courses/${courseId}`);
    setCourse(res.data);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, sRes, pRes, rRes] = await Promise.all([
          axios.get(`/api/courses/${courseId}`),
          axios.get(`/api/assignments/course/${courseId}/submissions`).catch(() => ({ data: [] })),
          axios.get(`/api/community/course/${courseId}`).catch(() => ({ data: [] })),
          axios.get(`/api/courses/${courseId}/reviews`).catch(() => ({ data: [] })),
        ]);
        setCourse(cRes.data);
        setSubmissions(sRes.data || []);
        setCommunityPosts(pRes.data || []);
        setReviews(rRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [courseId]);

  const openEdit = (lesson) => {
    setEditLesson(lesson);
    setEditForm({
      title: lesson.title || '',
      type: lesson.type || 'text',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      instructions: lesson.instructions || '',
      dueDate: lesson.dueDate || '',
      maxScore: lesson.maxScore || '',
    });
  };

  const handleSaveLesson = async () => {
    if (!editLesson) return;
    setSaving(true);
    try {
      await axios.put(`/api/courses/${courseId}/lessons/${editLesson.id}`, editForm);
      setEditLesson(null);
      await fetchCourse();
    } catch { alert('Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/courses/${courseId}/lessons/${lessonId}`);
      setEditLesson(null);
      await fetchCourse();
    } catch { alert('Delete failed.'); }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await axios.patch(`/api/courses/${courseId}/status?status=${newStatus}`);
      setCourse(p => ({ ...p, status: newStatus }));
    } catch { alert('Status update failed.'); }
    finally { setUpdatingStatus(false); }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  if (!course) return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center text-secondary">Course not found.</main>
    </div>
  );

  const totalLessons = (course.sections || []).reduce((a, s) => a + (s.lessons || []).length, 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <button onClick={() => navigate('/admin/courses')} className="flex items-center gap-2 text-secondary hover:text-primary text-sm font-semibold mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Courses
        </button>

        {/* Hero */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden mb-6">
          {course.thumbnailUrl && <img src={course.thumbnailUrl} alt={course.title} className="w-full h-48 object-cover" onError={e => e.target.remove()} />}
          <div className="p-8 flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {course.category && <span className="bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">{course.category}</span>}
                <select
                  value={course.status || 'DRAFT'}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className={`text-xs font-extrabold rounded-full px-3 py-1 border-0 outline-none cursor-pointer ${
                    course.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' :
                    course.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700' :
                    'bg-amber-50 text-amber-700'
                  }`}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <h1 className="text-3xl font-extrabold text-textMain mb-2">{course.title}</h1>
              {course.subtitle && <p className="text-secondary mb-3">{course.subtitle}</p>}
              <div className="flex flex-wrap gap-5 text-sm text-secondary">
                {course.instructorName && <button onClick={() => course.instructorId && navigate(`/admin/users/${course.instructorId}`)} className="hover:text-primary font-semibold transition-colors">👤 {course.instructorName}</button>}
                <span>👥 {(course.enrollmentCount || 0).toLocaleString()} students</span>
                <span>📚 {totalLessons} lessons</span>
                {avgRating && <span>⭐ {avgRating} ({reviews.length})</span>}
                <span className="font-extrabold text-primary">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
              </div>
            </div>
            <button onClick={async () => { if (window.confirm(`Delete "${course.title}"?`)) { await axios.delete(`/api/courses/${courseId}`); navigate('/admin/courses'); } }}
              className="bg-red-50 text-red-500 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors shrink-0">
              Delete Course
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-soft p-1.5">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold capitalize transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50'}`}>
              {TAB_ICONS[tab]} {tab}
            </button>
          ))}
        </div>

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {(course.sections || []).length === 0 ? (
              <div className="text-center py-12 text-secondary bg-white rounded-3xl border border-gray-100">No sections found.</div>
            ) : (course.sections || []).map((section, sIdx) => (
              <div key={section.id} className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-extrabold flex items-center justify-center shadow-soft-purple">{sIdx + 1}</div>
                  <h3 className="font-extrabold text-textMain">{section.title}</h3>
                  <span className="text-xs text-secondary ml-auto">{(section.lessons || []).length} lessons</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {(section.lessons || []).map((lesson) => (
                    <div key={lesson.id} className="px-5 py-4 flex items-start gap-4">
                      <span className="text-lg shrink-0 mt-0.5">{LESSON_ICON[lesson.type] || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-textMain text-sm">{lesson.title}</p>
                        <p className="text-xs text-secondary capitalize mt-0.5">{lesson.type}</p>
                        {lesson.type === 'assignment' && lesson.dueDate && (
                          <p className="text-xs text-amber-600 font-medium mt-0.5">Due: {lesson.dueDate}</p>
                        )}
                        {lesson.instructions && (
                          <p className="text-xs text-secondary mt-1 line-clamp-1 italic">"{lesson.instructions}"</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => openEdit(lesson)}
                          className="text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-xs bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg font-bold hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-secondary text-xs uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Content</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-secondary">No submissions yet.</td></tr>
                ) : submissions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => s.studentId && navigate(`/admin/users/${s.studentId}`)} className="font-semibold text-textMain hover:text-primary transition-colors">
                        {s.studentName || `#${s.studentId}`}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-secondary text-xs">{s.assignmentTitle || `#${s.assignmentId}`}</td>
                    <td className="px-6 py-4 text-secondary text-xs">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${s.status === 'GRADED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {s.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary">{s.score != null ? `${s.score}` : '-'}</td>
                    <td className="px-6 py-4">
                      {s.textContent
                        ? <p className="text-xs text-secondary line-clamp-1 max-w-[150px]">{s.textContent}</p>
                        : s.fileUrl
                          ? <span className="text-xs text-primary font-bold">File submitted</span>
                          : <span className="text-xs text-secondary">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COMMUNITY TAB */}
        {activeTab === 'community' && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {communityPosts.length === 0 ? (
              <div className="text-center py-12 text-secondary bg-white rounded-3xl border border-gray-100">No community messages yet.</div>
            ) : communityPosts.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {(p.authorName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <button onClick={() => p.authorId && navigate(`/admin/users/${p.authorId}`)} className="font-bold text-textMain text-sm hover:text-primary transition-colors">
                      {p.authorName || 'Unknown'}
                    </button>
                    <span className="text-xs text-secondary">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-textMain text-sm leading-relaxed">{p.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 flex items-center gap-8 mb-2">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-textMain mb-1">{avgRating}</p>
                  <div className="flex justify-center gap-0.5">
                    {[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= Math.round(parseFloat(avgRating)) ? 'text-amber-400' : 'text-gray-200'}`}>*</span>)}
                  </div>
                  <p className="text-xs text-secondary mt-1">{reviews.length} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="text-secondary w-3">{star}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${reviews.length > 0 ? (count/reviews.length)*100 : 0}%` }} /></div>
                        <span className="text-secondary w-4">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-secondary bg-white rounded-3xl border border-gray-100">No reviews yet.</div>
            ) : reviews.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {(r.studentName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-textMain">{r.studentName || 'Anonymous'}</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}>*</span>)}</div>
                    </div>
                    <p className="text-secondary text-sm leading-relaxed">{r.comment}</p>
                    {r.createdAt && <p className="text-xs text-secondary mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Lesson Modal */}
      {editLesson && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-textMain mb-6">Edit Lesson</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Title</label>
                <input value={editForm.title} onChange={e => setEditForm(p => ({...p, title: e.target.value}))} className="input-field text-sm" />
              </div>
              {editLesson.type === 'video' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Video URL</label>
                  <input value={editForm.videoUrl} onChange={e => setEditForm(p => ({...p, videoUrl: e.target.value}))} className="input-field text-sm" />
                </div>
              )}
              {(editLesson.type === 'text' || editLesson.type === 'video') && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Content</label>
                  <textarea value={editForm.content} onChange={e => setEditForm(p => ({...p, content: e.target.value}))} rows={5} className="input-field text-sm resize-none" />
                </div>
              )}
              {editLesson.type === 'assignment' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Instructions</label>
                    <textarea value={editForm.instructions} onChange={e => setEditForm(p => ({...p, instructions: e.target.value}))} rows={4} className="input-field text-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Due Date</label>
                      <input type="date" value={editForm.dueDate} onChange={e => setEditForm(p => ({...p, dueDate: e.target.value}))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-1.5">Max Score</label>
                      <input type="number" value={editForm.maxScore} onChange={e => setEditForm(p => ({...p, maxScore: e.target.value}))} className="input-field text-sm" placeholder="100" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditLesson(null)} className="flex-1 btn-secondary py-3">Cancel</button>
              <button onClick={handleSaveLesson} disabled={saving} className="flex-1 btn-primary py-3 shadow-soft-purple disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseDetail;
