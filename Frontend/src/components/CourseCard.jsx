import React from 'react';
import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const CATEGORY_COLORS = {
  Development: 'bg-blue-50 text-blue-600',
  Design: 'bg-pink-50 text-pink-600',
  Business: 'bg-green-50 text-green-600',
  Marketing: 'bg-orange-50 text-orange-600',
  'Data Science': 'bg-purple-50 text-purple-600',
  Photography: 'bg-yellow-50 text-yellow-700',
  Music: 'bg-red-50 text-red-600',
};

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80',
];

const CourseCard = ({ course, enrolled = false, compact = false }) => {
  const navigate = useNavigate();
  const img = course.thumbnailUrl || PLACEHOLDER_IMAGES[course.id % PLACEHOLDER_IMAGES.length];
  const catColor = CATEGORY_COLORS[course.category] || 'bg-primary/10 text-primary';
  const rating = course.averageRating || 0;
  const reviewCount = course.reviewCount || 0;
  const studentCount = course.enrollmentCount || 0;
  const accessIcon = course.accessType === 'PASSWORD_PROTECTED' ? '🔒' : course.accessType === 'INVITE_ONLY' ? '✉️' : null;

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(108,72,242,0.15)] transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden h-44">
        <img
          src={img}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = PLACEHOLDER_IMAGES[0]; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {accessIcon && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {accessIcon} {course.accessType === 'PASSWORD_PROTECTED' ? 'Protected' : 'Invite Only'}
          </div>
        )}
        {enrolled && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            ✓ Enrolled
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <span className={`self-start text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${catColor}`}>
          {course.category || 'General'}
        </span>

        {/* Title */}
        <h3 className="font-bold text-textMain text-[15px] leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        {course.instructorName && (
          <p className="text-xs text-secondary mb-3">by {course.instructorName}</p>
        )}

        {/* Rating */}
        {!compact && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-500 font-bold text-sm">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
            <StarRating rating={rating} />
            {reviewCount > 0 && <span className="text-xs text-secondary">({reviewCount})</span>}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1 text-secondary text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {studentCount.toLocaleString()} students
          </div>
          <span className="text-primary font-extrabold text-base">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
