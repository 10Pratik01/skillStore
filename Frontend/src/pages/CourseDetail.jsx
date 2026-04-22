import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const StarRating = ({ rating = 0, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`w-5 h-5 transition-colors ${interactive ? 'cursor-pointer' : ''} ${star <= (hovered || rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const LESSON_ICONS = {
  video: '🎬',
  text: '📄',
  assignment: '📎',
  quiz: '❓',
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Open sections in curriculum
  const [openSections, setOpenSections] = useState([0]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, reviewRes] = await Promise.all([
          axios.get(`/api/courses/${courseId}`),
          axios.get(`/api/courses/${courseId}/reviews`).catch(() => ({ data: [] })),
        ]);
        setCourse(courseRes.data);
        setReviews(reviewRes.data || []);

        if (user) {
          const studentId = user.id || 1;
          const enrollRes = await axios.get(`/api/orders/student/${studentId}/enrollments`).catch(() => ({ data: [] }));
          const isEnrolled = (enrollRes.data || []).some(e => String(e.courseId) === String(courseId));
          setEnrolled(isEnrolled);
        }
      } catch (e) {
        console.error('Failed to load course detail', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [courseId, user]);

  const handleEnrollClick = () => {
    if (!user) { navigate('/login'); return; }
    if (course.accessType === 'PASSWORD_PROTECTED') { setShowPasswordModal(true); return; }
    if (course.accessType === 'INVITE_ONLY') { alert('This course is invite-only. Please contact the instructor.'); return; }
    doEnroll(null);
  };

  const doEnroll = async (code) => {
    setEnrolling(true);
    try {
      await axios.post('/api/orders/purchase', { courseId: parseInt(courseId), studentId: user.id || 1, accessCode: code });
      setEnrolled(true);
      setShowPasswordModal(false);
    } catch (e) {
      if (e.response?.status === 403) setPasswordError('Incorrect access code. Please try again.');
      else alert('Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await axios.post(`/api/courses/${courseId}/reviews`, { rating: reviewRating, comment: reviewText, studentId: user?.id || 1 });
      setReviewSubmitted(true);
      const res = await axios.get(`/api/courses/${courseId}/reviews`).catch(() => ({ data: [] }));
      setReviews(res.data || []);
    } catch (e) { console.error(e); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-secondary font-medium">Loading course...</p></div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><p className="text-4xl mb-4">😕</p><p className="text-xl font-bold text-textMain">Course not found</p><Link to="/courses" className="btn-primary mt-4 inline-block">Back to Courses</Link></div>
    </div>
  );

  const ratingAvg = course.averageRating || (reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0);
  const totalLessons = (course.sections || []).reduce((a, s) => a + (s.lessons || []).length, 0);

  return (
    <div className="min-h-screen bg-background">

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-soft">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-extrabold text-textMain mb-1">Access Code Required</h3>
              <p className="text-secondary text-sm">This course is protected. Enter the access code provided by your instructor.</p>
            </div>
            <input
              type="text"
              value={accessCode}
              onChange={e => { setAccessCode(e.target.value); setPasswordError(''); }}
              className="input-field mb-2 text-center text-lg tracking-widest font-bold"
              placeholder="Enter code..."
            />
            {passwordError && <p className="text-red-500 text-sm text-center mb-4">{passwordError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowPasswordModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => doEnroll(accessCode)} disabled={enrolling || !accessCode} className="btn-primary flex-1 disabled:opacity-60">
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ───────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-secondary mb-6">
            <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
            <span>/</span>
            <span className="text-primary font-semibold truncate max-w-xs">{course.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left - Info */}
            <div className="flex-1">
              {course.category && (
                <span className="inline-block bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                  {course.category}
                </span>
              )}
              <h1 className="text-4xl font-extrabold text-textMain mb-3 leading-tight">{course.title}</h1>
              {course.subtitle && <p className="text-xl text-secondary mb-4">{course.subtitle}</p>}

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                {ratingAvg > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">{ratingAvg.toFixed(1)}</span>
                    <StarRating rating={ratingAvg} />
                    <span className="text-secondary">({reviews.length} reviews)</span>
                  </div>
                )}
                <span className="text-secondary">👥 {(course.enrollmentCount || 0).toLocaleString()} students</span>
                <span className="text-secondary">📚 {totalLessons} lessons</span>
                {course.accessType === 'PASSWORD_PROTECTED' && <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-bold text-xs">🔒 Password Protected</span>}
                {course.accessType === 'INVITE_ONLY' && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold text-xs">✉️ Invite Only</span>}
              </div>

              {course.instructorName && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white flex items-center justify-center font-bold text-sm shadow-soft-purple">
                    {course.instructorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-secondary">Created by <span className="font-bold text-textMain">{course.instructorName}</span></span>
                </div>
              )}
            </div>

            {/* Right - Sticky Enroll Card */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden sticky top-24">
                <img
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'}
                  alt={course.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-6">
                  <div className="text-3xl font-extrabold text-textMain mb-6">
                    {course.price === 0 ? <span className="text-green-500">Free</span> : `$${course.price}`}
                  </div>

                  {enrolled ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl font-bold text-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        You're enrolled!
                      </div>
                      <button onClick={() => navigate(`/courses/${courseId}/learn`)} className="btn-primary w-full py-4 text-base">
                        Continue Learning →
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleEnrollClick} disabled={enrolling} className="btn-primary w-full py-4 text-base shadow-soft-purple disabled:opacity-60">
                      {enrolling ? 'Enrolling...' : course.accessType === 'INVITE_ONLY' ? 'Request Access' : 'Enroll Now →'}
                    </button>
                  )}

                  <ul className="mt-6 space-y-2 text-sm text-secondary">
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Full lifetime access</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Live Q&A community</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Graded assignments & quizzes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex gap-2">
          {['overview', 'curriculum', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-bold text-sm capitalize transition-all border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-textMain'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {course.description && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft">
                <h2 className="text-xl font-extrabold text-textMain mb-4">About This Course</h2>
                <p className="text-secondary leading-relaxed">{course.description}</p>
              </div>
            )}
          </div>
        )}

        {/* CURRICULUM TAB */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-textMain">{(course.sections || []).length} Sections · {totalLessons} Lessons</h2>
            </div>
            {(course.sections || []).map((section, sIdx) => (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <button
                  onClick={() => setOpenSections(prev => prev.includes(sIdx) ? prev.filter(i => i !== sIdx) : [...prev, sIdx])}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">{sIdx + 1}</span>
                    <span className="font-bold text-textMain">{section.title}</span>
                    <span className="text-xs text-secondary ml-2">{(section.lessons || []).length} lessons</span>
                  </div>
                  <svg className={`w-5 h-5 text-secondary transition-transform ${openSections.includes(sIdx) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {openSections.includes(sIdx) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {(section.lessons || []).map((lesson, lIdx) => (
                      <div key={lesson.id} className={`flex items-center gap-4 px-5 py-3.5 ${enrolled ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                        onClick={() => enrolled && navigate(`/courses/${courseId}/learn`)}>
                        <span className="text-lg">{LESSON_ICONS[lesson.type] || '📄'}</span>
                        <span className={`flex-1 text-sm font-medium ${enrolled ? 'text-textMain' : 'text-secondary'}`}>{lesson.title}</span>
                        {!enrolled && <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        <span className="text-xs text-secondary capitalize">{lesson.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft flex items-center gap-8">
              <div className="text-center shrink-0">
                <div className="text-6xl font-extrabold text-textMain">{ratingAvg > 0 ? ratingAvg.toFixed(1) : '–'}</div>
                <StarRating rating={ratingAvg} />
                <p className="text-secondary text-xs mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="text-secondary w-3">{star}</span>
                      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-secondary w-4">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write review (enrolled students) */}
            {enrolled && !reviewSubmitted && (
              <div className="bg-white rounded-3xl p-8 border border-primary/20 shadow-soft">
                <h3 className="font-extrabold text-textMain mb-4">Share Your Experience</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <p className="text-sm text-secondary mb-2 font-medium">Your Rating</p>
                    <StarRating rating={reviewRating} interactive onRate={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="input-field h-28 resize-none mb-4"
                    placeholder="What did you think of this course?"
                    required
                  />
                  <button type="submit" disabled={submittingReview} className="btn-primary shadow-soft-purple disabled:opacity-60">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
            {reviewSubmitted && <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-5 font-bold text-center">✓ Review submitted! Thank you.</div>}

            {/* Review list */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-secondary">No reviews yet. Be the first!</div>
              ) : (
                reviews.map((review, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white flex items-center justify-center font-bold shrink-0">
                        {(review.studentName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-textMain">{review.studentName || 'Anonymous'}</span>
                          <span className="text-xs text-secondary">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <StarRating rating={review.rating} />
                        <p className="text-secondary text-sm mt-2 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
