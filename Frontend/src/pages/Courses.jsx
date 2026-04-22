import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';

const CATEGORIES = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Data Science', 'Photography', 'Music'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const PRICE_FILTERS = ['All', 'Free', 'Paid'];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [minRating, setMinRating] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLevel !== 'All') params.level = selectedLevel;

      const hasFilters = searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All';
      const url = hasFilters ? '/api/courses/search' : '/api/courses';
      const response = await axios.get(url, { params });
      let data = response.data || [];

      // Client-side price filter
      if (selectedPrice === 'Free') data = data.filter(c => c.price === 0);
      if (selectedPrice === 'Paid') data = data.filter(c => c.price > 0);

      // Client-side rating filter
      if (minRating > 0) data = data.filter(c => (c.averageRating || 0) >= minRating);

      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLevel, selectedPrice, minRating]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchCourses(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO BAR ─────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-primary font-extrabold text-xs uppercase tracking-widest block mb-3">Explore</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-textMain mb-4">Find Your Next Course</h1>
          <p className="text-secondary mb-8">Browse from 580+ expert-led courses across every discipline.</p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search courses, topics, skills..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-textMain focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-8">

        {/* ── SIDEBAR FILTERS ───────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-8">

          {/* Category */}
          <div>
            <h4 className="font-extrabold text-textMain text-sm uppercase tracking-wider mb-4">Category</h4>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <h4 className="font-extrabold text-textMain text-sm uppercase tracking-wider mb-4">Level</h4>
            <div className="space-y-1">
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedLevel === lvl ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <h4 className="font-extrabold text-textMain text-sm uppercase tracking-wider mb-4">Price</h4>
            <div className="space-y-1">
              {PRICE_FILTERS.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPrice(p)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedPrice === p ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="font-extrabold text-textMain text-sm uppercase tracking-wider mb-4">Min. Rating</h4>
            <div className="space-y-1">
              {[0, 3, 3.5, 4, 4.5].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${minRating === r ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}
                >
                  {r === 0 ? 'Any Rating' : (
                    <>
                      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {r}+ Stars
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(selectedCategory !== 'All' || selectedLevel !== 'All' || selectedPrice !== 'All' || minRating > 0 || searchQuery) && (
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedLevel('All'); setSelectedPrice('All'); setMinRating(0); setSearchQuery(''); }}
              className="text-sm text-primary font-bold hover:underline"
            >
              Clear all filters ×
            </button>
          )}
        </aside>

        {/* ── COURSE GRID ───────────────────────────── */}
        <div className="flex-1">
          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden scrollbar-hide mb-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${selectedCategory === cat ? 'bg-primary text-white border-primary shadow-soft-purple' : 'bg-white text-secondary border-gray-200 hover:border-primary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-secondary text-sm font-medium">
              {loading ? 'Searching...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 h-72 animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-textMain mb-2">No courses found</h3>
              <p className="text-secondary">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
