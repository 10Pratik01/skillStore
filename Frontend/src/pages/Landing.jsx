import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';

const STATS = [
  { value: '12,400+', label: 'Active Students', icon: '🧑‍🎓' },
  { value: '580+', label: 'Expert Courses', icon: '📚' },
  { value: '210+', label: 'Instructors', icon: '🎓' },
  { value: '94%', label: 'Completion Rate', icon: '🏆' },
];

const HOW_STEPS_STUDENT = [
  { step: '01', title: 'Browse & Enroll', desc: 'Explore hundreds of courses across categories. Filter by level, price, or rating.' },
  { step: '02', title: 'Learn at Your Pace', desc: 'Watch videos, complete assignments, and take quizzes on your own schedule.' },
  { step: '03', title: 'Get Certified', desc: 'Earn certificates upon completion and share your achievement.' },
];

const HOW_STEPS_INSTRUCTOR = [
  { step: '01', title: 'Create Your Course', desc: 'Build a rich curriculum with videos, text lessons, assignments, and quizzes.' },
  { step: '02', title: 'Grow Your Audience', desc: 'Publish publicly or invite students privately with an access code.' },
  { step: '03', title: 'Track & Engage', desc: 'Grade submissions, view student progress, and answer questions live.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Frontend Developer', text: 'LuminaLearn transformed my career. The course quality is outstanding and the community support is incredible.', avatar: 'P' },
  { name: 'Arjun Mehta', role: 'Data Scientist', text: 'The instructor tools are best-in-class. I was able to build and publish my first course in a weekend.', avatar: 'A' },
  { name: 'Sofia Chen', role: 'UX Designer', text: 'Real-time Q&A during lessons is a game-changer. I always get answers exactly when I need them.', avatar: 'S' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/courses');
        setFeaturedCourses((res.data || []).slice(0, 6));
      } catch (e) {
        setFeaturedCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4">
        {/* Background blobs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-primary/20 shadow-soft-purple rounded-full px-5 py-2 text-sm font-semibold text-primary mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            500+ new students this week
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-textMain leading-[1.1] tracking-tight mb-6">
            Learn anything.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Teach everyone.
            </span>
          </h1>

          <p className="text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Immersive, expert-guided courses with real-time Q&A, live assignments, and a thriving community of learners.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/courses')}
              className="btn-primary text-base px-8 py-4 rounded-2xl shadow-soft-purple hover:scale-105"
            >
              Explore Courses →
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary text-base px-8 py-4 rounded-2xl hover:scale-105"
            >
              Start Teaching Free
            </button>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(108,72,242,0.15)] border border-gray-100 overflow-hidden p-1">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
                alt="Students learning"
                className="w-full h-72 object-cover rounded-[20px]"
              />
            </div>
            {/* Floating card 1 */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-soft p-4 border border-gray-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">✓</div>
                <div>
                  <p className="font-bold text-textMain text-sm">Quiz Passed!</p>
                  <p className="text-xs text-secondary">Score: 98/100</p>
                </div>
              </div>
            </div>
            {/* Floating card 2 */}
            <div className="absolute -right-8 bottom-8 bg-white rounded-2xl shadow-soft p-4 border border-gray-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">🔔</div>
                <div>
                  <p className="font-bold text-textMain text-sm">New Assignment</p>
                  <p className="text-xs text-secondary">React Hooks – Week 3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-4xl font-extrabold text-textMain mb-1">{s.value}</div>
              <div className="text-secondary text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED COURSES ────────────────────────── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary font-extrabold text-sm uppercase tracking-widest block mb-2">Top Picks</span>
            <h2 className="text-4xl font-extrabold text-textMain">Featured Courses</h2>
          </div>
          <Link to="/courses" className="btn-secondary text-sm px-6 py-3">
            View all courses →
          </Link>
        </div>

        {loadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="text-center py-20 text-secondary">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg font-semibold">Courses are loading from the server.</p>
            <p className="text-sm mt-2">Make sure the backend is running, then refresh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-background to-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-extrabold text-sm uppercase tracking-widest block mb-2">Simple Process</span>
            <h2 className="text-4xl font-extrabold text-textMain">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Student Journey */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">🧑‍🎓</div>
                <h3 className="text-xl font-extrabold text-textMain">For Students</h3>
              </div>
              <div className="space-y-6">
                {HOW_STEPS_STUDENT.map(s => (
                  <div key={s.step} className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-soft-purple">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-textMain mb-1">{s.title}</h4>
                      <p className="text-secondary text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Journey */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl">🎓</div>
                <h3 className="text-xl font-extrabold text-textMain">For Instructors</h3>
              </div>
              <div className="space-y-6">
                {HOW_STEPS_INSTRUCTOR.map(s => (
                  <div key={s.step} className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-[0_10px_20px_rgba(168,85,247,0.25)]">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-textMain mb-1">{s.title}</h4>
                      <p className="text-secondary text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────── */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary font-extrabold text-sm uppercase tracking-widest block mb-2">Community Love</span>
          <h2 className="text-4xl font-extrabold text-textMain">What People Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft hover:shadow-soft-purple transition-shadow">
              <div className="flex mb-4">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-textMain text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white flex items-center justify-center font-bold shadow-soft-purple">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-textMain text-sm">{t.name}</p>
                  <p className="text-xs text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-purple-500 rounded-[2.5rem] p-16 text-center relative overflow-hidden shadow-soft-purple">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-2xl -ml-20 -mb-20" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Ready to start learning?</h2>
            <p className="text-white/80 text-lg mb-10">Join thousands of students already on LuminaLearn today.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => navigate('/register')} className="bg-white text-primary font-extrabold px-8 py-4 rounded-2xl shadow-soft hover:bg-gray-50 transition-colors hover:scale-105">
                Create Free Account
              </button>
              <button onClick={() => navigate('/courses')} className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors hover:scale-105">
                Browse Courses
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-soft-purple">LL</div>
                <span className="text-lg font-extrabold text-primary">LuminaLearn</span>
              </div>
              <p className="text-secondary text-sm leading-relaxed">The modern platform for expert-led learning experiences.</p>
            </div>
            <div>
              <h5 className="font-bold text-textMain mb-4">Platform</h5>
              <ul className="space-y-2 text-sm text-secondary">
                <li><Link to="/courses" className="hover:text-primary transition-colors">Browse Courses</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Become an Instructor</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-textMain mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-textMain mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-sm text-secondary">
            © {new Date().getFullYear()} LuminaLearn. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
