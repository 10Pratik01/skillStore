import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Data Science', 'Photography', 'Music'];

const StarRating = ({ rating, interactive = false, onRate }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <svg
                    key={star}
                    onClick={() => interactive && onRate && onRate(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    className={`w-4 h-4 transition-colors ${interactive ? 'cursor-pointer' : ''} ${
                        star <= (hovered || rating) ? 'text-yellow-400' : 'text-white/20'
                    }`}
                    fill="currentColor" viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { user } = useAuth();

    const [checkoutCourse, setCheckoutCourse] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [discountResponse, setDiscountResponse] = useState(null);

    // Review Modal
    const [reviewCourse, setReviewCourse] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.q = searchQuery;
            if (selectedCategory !== 'All') params.category = selectedCategory;

            const hasFilters = searchQuery || selectedCategory !== 'All';
            const url = hasFilters ? '/api/courses/search' : '/api/courses';
            const response = await axios.get(url, { params });
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    // Debounced search: trigger fetch 400ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => { fetchCourses(); }, 400);
        return () => clearTimeout(timer);
    }, [fetchCourses]);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode) return;
        setValidatingCoupon(true);
        try {
            const res = await axios.get(`/api/coupons/validate/${couponCode}?courseId=${checkoutCourse.id}`);
            setDiscountResponse({ success: true, ...res.data });
        } catch (error) {
            setDiscountResponse({ success: false, message: error.response?.data || "Invalid coupon" });
        } finally {
            setValidatingCoupon(false);
        }
    };

    const confirmEnrollment = async () => {
        try {
            await axios.post(`/api/orders/enroll?studentId=${user.id}&courseId=${checkoutCourse.id}&couponCode=${couponCode}`);
            alert("Payment Successful! You are now enrolled.");
            setCheckoutCourse(null);
            setCouponCode('');
            setDiscountResponse(null);
        } catch (error) {
            alert(error.response?.data || "Failed to process payment");
        }
    };

    const handleSubmitReview = async () => {
        try {
            await axios.post(`/api/courses/${reviewCourse.id}/reviews`, {
                studentId: user.id,
                rating: reviewRating,
                comment: reviewComment
            });
            alert('Review submitted! Thank you.');
            setReviewCourse(null);
            setReviewComment('');
            setReviewRating(5);
            fetchCourses(); // Refresh to show updated avg rating
        } catch (err) {
            alert('Failed to submit review.');
        }
    };

    const finalPrice = discountResponse?.success
        ? Math.max(0, checkoutCourse.price - (discountResponse.type === 'PERCENTAGE' ? checkoutCourse.price * (discountResponse.value / 100) : discountResponse.value))
        : (checkoutCourse ? checkoutCourse.price : 0);

    return (
        <div className="p-8 max-w-7xl mx-auto relative">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Course Catalog</h2>
                <p className="text-secondary">Explore our library of expert-led courses.</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="mb-8 space-y-4">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        id="course-search"
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search courses by title..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                                selectedCategory === cat
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-white/5 text-secondary hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="text-center text-primary py-12">Searching courses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length === 0 ? (
                        <div className="col-span-full text-center text-secondary py-12">No courses found matching your search.</div>
                    ) : (
                        courses.map(course => (
                            <div key={course.id} className="glass flex flex-col transition-transform hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-2xl overflow-hidden">
                                <div className="p-6 flex-1 flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 bg-primary/10 px-2 py-1 rounded self-start">
                                        {course.category || 'General'}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-secondary text-sm mb-4 line-clamp-3 flex-1">{course.description}</p>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <StarRating rating={Math.round(course.averageRating || 0)} />
                                        <span className="text-xs text-secondary">
                                            {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings yet'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <span className="text-lg font-bold text-white">${course.price}</span>
                                        <div className="flex gap-2">
                                            {user?.role === 'STUDENT' && (
                                                <>
                                                    <button
                                                        onClick={() => setReviewCourse(course)}
                                                        className="text-yellow-400 hover:text-yellow-300 transition-colors p-2 rounded-lg hover:bg-yellow-400/10"
                                                        title="Leave a Review"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    </button>
                                                    <button onClick={() => setCheckoutCourse(course)} className="btn-primary py-2 px-4 text-sm">
                                                        Enroll
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Checkout Modal */}
            {checkoutCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm slide-up">
                    <div className="glass max-w-md w-full p-8 relative border border-primary/30 shadow-2xl shadow-primary/20">
                        <button onClick={() => { setCheckoutCourse(null); setCouponCode(''); setDiscountResponse(null); }} className="absolute top-4 right-4 text-secondary hover:text-white text-xl">&times;</button>
                        <h3 className="text-2xl font-bold text-white mb-6">Secure Checkout</h3>
                        <div className="bg-white/5 p-4 rounded-lg mb-6 border border-white/10">
                            <h4 className="font-bold text-white tracking-wide mb-1">{checkoutCourse.title}</h4>
                            <p className="text-sm text-secondary line-clamp-1">{checkoutCourse.description}</p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-secondary mb-2">Have a coupon code?</label>
                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Enter code" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary text-sm uppercase" />
                                <button type="submit" disabled={validatingCoupon || !couponCode} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">{validatingCoupon ? 'Wait' : 'Apply'}</button>
                            </form>
                            {discountResponse && (
                                <p className={`text-xs mt-2 font-semibold ${discountResponse.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {discountResponse.success ? `Coupon Applied! ${discountResponse.type === 'FLAT' ? '-$'+discountResponse.value : discountResponse.value+'% off'}!` : discountResponse.message}
                                </p>
                            )}
                        </div>
                        <div className="border-t border-white/10 pt-4 mb-8">
                            <div className="flex justify-between items-center mb-2 text-secondary"><span>Original Price:</span><span>${checkoutCourse.price}</span></div>
                            {discountResponse?.success && (<div className="flex justify-between items-center mb-2 text-green-400 font-semibold"><span>Discount:</span><span>-${(checkoutCourse.price - finalPrice).toFixed(2)}</span></div>)}
                            <div className="flex justify-between items-center text-xl font-bold text-white border-t border-white/10 pt-4 mt-2"><span>Total to Pay:</span><span>${finalPrice.toFixed(2)}</span></div>
                        </div>
                        <button onClick={confirmEnrollment} className="btn-primary w-full py-4 text-lg animate-pulse hover:animate-none">Pay Mock ${finalPrice.toFixed(2)}</button>
                        <p className="text-center text-xs text-secondary mt-4 opacity-50">Powered by Stripe Simulation API</p>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm slide-up">
                    <div className="glass max-w-md w-full p-8 relative border border-yellow-500/30 shadow-2xl shadow-yellow-500/10">
                        <button onClick={() => setReviewCourse(null)} className="absolute top-4 right-4 text-secondary hover:text-white text-xl">&times;</button>
                        <h3 className="text-2xl font-bold text-white mb-2">Leave a Review</h3>
                        <p className="text-secondary text-sm mb-6">{reviewCourse.title}</p>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-secondary mb-2">Your Rating</label>
                            <StarRating rating={reviewRating} interactive={true} onRate={setReviewRating} />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-secondary mb-2">Your Review</label>
                            <textarea
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors text-sm"
                                placeholder="Share your experience with this course..."
                            />
                        </div>
                        <button onClick={handleSubmitReview} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 transition-colors text-black font-bold rounded-xl">
                            Submit Review
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
